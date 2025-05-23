const prisma = require('../prisma/client');

const atualizarValoresItem = async (req, res) => {
  try {
    // 1) Extrai do body todos os campos esperados
    const {
      setorId,
      itemId,
      ano,
      mes,
      valorFieam,
      valorSesi,
      valorSenai,
      valorIel,
      totalGeral,
      estrategia,
    } = req.body;

    // 2) Normaliza tudo para Number (evita strings “2” etc.)
    const numericSetorId = Number(setorId);
    const numericItemId = Number(itemId);
    const numericAno = Number(ano);
    const numericMes = Number(mes);

    const vFieamNovo = Number(valorFieam);
    const vSesiNovo = Number(valorSesi);
    const vSenaiNovo = Number(valorSenai);
    const vIelNovo = Number(valorIel);
    const totGeralNovo = Number(totalGeral);

    if (
      isNaN(numericSetorId) ||
      isNaN(numericItemId) ||
      isNaN(numericAno) ||
      isNaN(numericMes) ||
      isNaN(vFieamNovo) ||
      isNaN(vSesiNovo) ||
      isNaN(vSenaiNovo) ||
      isNaN(vIelNovo) ||
      isNaN(totGeralNovo)
    ) {
      return res.status(400).json({ message: 'Dados inválidos no body.' });
    }

    // 3) Tenta encontrar o histórico existente para (itemId, setorId, ano, mes)
    const historicoExistente = await prisma.historico.findFirst({
      where: {
        itemId: numericItemId,
        setorId: numericSetorId,
        ano: numericAno,
        mes: numericMes,
      },
    });

    let novosValoresHistorico = {
      valorFieam: vFieamNovo,
      valorSesi: vSesiNovo,
      valorSenai: vSenaiNovo,
      valorIel: vIelNovo,
      totalGeral: totGeralNovo,
    };

    if (historicoExistente) {
      // 3.a) Se já existe histórico, pega os valores antigos (ou 0, se null)
      const vFieamAntigo = historicoExistente.valorFieam ?? 0;
      const vSesiAntigo = historicoExistente.valorSesi ?? 0;
      const vSenaiAntigo = historicoExistente.valorSenai ?? 0;
      const vIelAntigo = historicoExistente.valorIel ?? 0;
      const totAntigo = historicoExistente.totalGeral ?? 0;

      // 3.b) Calcula novosValoresHistorico conforme a estratégia
      if (estrategia === 'somar') {
        novosValoresHistorico = {
          valorFieam: vFieamAntigo + vFieamNovo,
          valorSesi: vSesiAntigo + vSesiNovo,
          valorSenai: vSenaiAntigo + vSenaiNovo,
          valorIel: vIelAntigo + vIelNovo,
          totalGeral: totAntigo + totGeralNovo,
        };
      } else if (estrategia === 'media') {
        novosValoresHistorico = {
          valorFieam: (vFieamAntigo + vFieamNovo) / 2,
          valorSesi: (vSesiAntigo + vSesiNovo) / 2,
          valorSenai: (vSenaiAntigo + vSenaiNovo) / 2,
          valorIel: (vIelAntigo + vIelNovo) / 2,
          totalGeral: (totAntigo + totGeralNovo) / 2,
        };
      } else if (estrategia === 'manter') {
        // “último valor” simplesmente pegar o que veio do body
        novosValoresHistorico = {
          valorFieam: vFieamNovo,
          valorSesi: vSesiNovo,
          valorSenai: vSenaiNovo,
          valorIel: vIelNovo,
          totalGeral: totGeralNovo,
        };
      } else {
        return res.status(400).json({ message: 'Estratégia inválida.' });
      }

      // 3.c) Atualiza o registro de histórico
      await prisma.historico.update({
        where: { id: historicoExistente.id },
        data: {
          ...novosValoresHistorico,
          dataAlteracao: new Date(),
        },
      });
    } else {
      // 3.d) Se não existia histórico, cria um novo com base na estratégia
      //    (nota: para “média”, se não existia, ficamos com metade do novo valor)
      if (estrategia === 'somar' || estrategia === 'ultimo') {
        // Neste caso, quando não existia antes, soma==novo ou último==novo
        novosValoresHistorico = {
          valorFieam: vFieamNovo,
          valorSesi: vSesiNovo,
          valorSenai: vSenaiNovo,
          valorIel: vIelNovo,
          totalGeral: totGeralNovo,
        };
      } else if (estrategia === 'media') {
        novosValoresHistorico = {
          valorFieam: vFieamNovo / 2,
          valorSesi: vSesiNovo / 2,
          valorSenai: vSenaiNovo / 2,
          valorIel: vIelNovo / 2,
          totalGeral: totGeralNovo / 2,
        };
      }

      await prisma.historico.create({
        data: {
          itemId: numericItemId,
          setorId: numericSetorId,
          ano: numericAno,
          mes: numericMes,
          valorFieam: novosValoresHistorico.valorFieam,
          valorSesi: novosValoresHistorico.valorSesi,
          valorSenai: novosValoresHistorico.valorSenai,
          valorIel: novosValoresHistorico.valorIel,
          totalGeral: novosValoresHistorico.totalGeral,
          usuarioId: req.usuario.id,   // ajuste conforme seu middleware de autenticação
          dataAlteracao: new Date(),
        },
      });
    }

    // 4) Agora atualiza (ou cria) os registros em valor_item para cada instituição
    //    Para cada instituição, usamos o valor vindo no body (não somamos nem fazemos média aqui).
    //    Se você quiser aplicar soma/média nesse valor_item também, troque Number(...) pelo cálculo
    //    de “valorAtualNoBanco + vXNovo” ou “(valorAtual + vXNovo)/2”.

    // 4.a) FIEAM (instituicao_id = 1)
    const updateFieam = await prisma.valor_item.updateMany({
      where: {
        item_id: numericItemId,
        mes: numericMes,
        instituicao_id: 1,
      },
      data: {
        valor: vFieamNovo,
      },
    });
    // Se não existir nenhum registro para (item_id, mes, instituicao_id=1), talvez queira criar:
    if (updateFieam.count === 0) {
      await prisma.valor_item.create({
        data: {
          item_id: numericItemId,
          instituicao_id: 1,
          mes: numericMes,
          valor: vFieamNovo,
        },
      });
    }

    // 4.b) SESI (instituicao_id = 2)
    const updateSesi = await prisma.valor_item.updateMany({
      where: {
        item_id: numericItemId,
        mes: numericMes,
        instituicao_id: 2,
      },
      data: {
        valor: vSesiNovo,
      },
    });
    if (updateSesi.count === 0) {
      await prisma.valor_item.create({
        data: {
          item_id: numericItemId,
          instituicao_id: 2,
          mes: numericMes,
          valor: vSesiNovo,
        },
      });
    }

    // 4.c) SENAI (instituicao_id = 3)
    const updateSenai = await prisma.valor_item.updateMany({
      where: {
        item_id: numericItemId,
        mes: numericMes,
        instituicao_id: 3,
      },
      data: {
        valor: vSenaiNovo,
      },
    });
    if (updateSenai.count === 0) {
      await prisma.valor_item.create({
        data: {
          item_id: numericItemId,
          instituicao_id: 3,
          mes: numericMes,
          valor: vSenaiNovo,
        },
      });
    }

    // 4.d) IEL (instituicao_id = 4)
    const updateIel = await prisma.valor_item.updateMany({
      where: {
        item_id: numericItemId,
        mes: numericMes,
        instituicao_id: 4,
      },
      data: {
        valor: vIelNovo,
      },
    });
    if (updateIel.count === 0) {
      await prisma.valor_item.create({
        data: {
          item_id: numericItemId,
          instituicao_id: 4,
          mes: numericMes,
          valor: vIelNovo,
        },
      });
    }

    // 5) Retorna resposta de sucesso
    return res.status(200).json({
      message: 'Valores atualizados com sucesso no Histórico e em valor_item.',
      historicoAtualizado: novosValoresHistorico,
      atualizacoesValorItem: {
        fieam: updateFieam.count,
        sesi: updateSesi.count,
        senai: updateSenai.count,
        iel: updateIel.count,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar valores do item:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar valores.' });
  }
};

module.exports = { atualizarValoresItem };
