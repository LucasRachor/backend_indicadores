const prisma = require('../prisma/client');

async function atualizarValor(numero, valor, itemId, mes) {

  try {
    return await prisma.valor_item.updateMany({
      where: {
        item_id: itemId,
        mes: mes,
        instituicao_id: numero,
      },
      data: {
        valor: valor,
      },
    });

  } catch (error) {
    console.log(error);
  }
}

const cadastrarItem = async (req, res) => {
  try {
    const { nome, detalhes, setorId, ano, instituicoes, atividade, moeda } = req.body;

    // 1. Cadastrar item
    const novoItem = await prisma.item.create({
      data: {
        nome,
        detalhes,
        setor_id: setorId,
        ano,
        atividade,
        moeda,
      },
    });

    // 2. Cadastrar instituições se não existirem
    const instituicoesSalvas = [];
    for (const nomeInst of instituicoes) {
      const inst = await prisma.instituicao.upsert({
        where: { nome: nomeInst },
        update: {},
        create: { nome: nomeInst },
      });
      instituicoesSalvas.push(inst);
    }

    // 3. Cadastrar os 12 meses para cada instituição com valor 0
    const registrosValorItem = [];
    for (const inst of instituicoesSalvas) {
      for (let mes = 1; mes <= 12; mes++) {
        registrosValorItem.push({
          item_id: novoItem.id,
          instituicao_id: inst.id,
          mes,
          valor: 0,
        });
      }
    }

    await prisma.valor_item.createMany({
      data: registrosValorItem,
    });

    res.status(201).json({ message: 'Item e valores cadastrados com sucesso.' });
  } catch (error) {
    console.error('Erro ao cadastrar item:', error);
    res.status(500).json({ error: error.message });
    console.error('Erro ao cadastrar item:', error);

  }
};

const atualizarValoresItem = async (req, res) => {
  try {
    // definimos o nosso data:
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

    if (valorFieam === 0 && valorSesi === 0 && valorSenai === 0 && valorIel === 0) {
      return res.status(400).json({
        message: "Valores em branco, tente novamente!"
      })
    }

    // mapeamento dos valores por instiuição
    const chavesPorInstituicao = [
      "valorFieam",
      "valorSesi",
      "valorSenai",
      "valorIel",
    ];

    // convertemos todos os valores para Number
    const numericSetorId = Number(setorId);
    const numericItemId = Number(itemId);
    const numericAno = Number(ano);
    const numericMes = Number(mes);

    const vFieamNovo = Number(valorFieam);
    const vSesiNovo = Number(valorSesi);
    const vSenaiNovo = Number(valorSenai);
    const vIelNovo = Number(valorIel);
    const totGeralNovo = Number(totalGeral);

    // verifica se algum dado é NaN
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

    // tenta encontrar o histórico existente para a data que veio do body
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
      // se já existe histórico, pega os valores antigos (ou 0, se null)
      const vFieamAntigo = historicoExistente.valorFieam ?? 0;
      const vSesiAntigo = historicoExistente.valorSesi ?? 0;
      const vSenaiAntigo = historicoExistente.valorSenai ?? 0;
      const vIelAntigo = historicoExistente.valorIel ?? 0;
      const totAntigo = historicoExistente.totalGeral ?? 0;

      switch (estrategia) {
        case 'somar':
          novosValoresHistorico = {
            valorFieam: vFieamAntigo + vFieamNovo,
            valorSesi: vSesiAntigo + vSesiNovo,
            valorSenai: vSenaiAntigo + vSenaiNovo,
            valorIel: vIelAntigo + vIelNovo,
            totalGeral: totAntigo + totGeralNovo,
          };

          break;

        case 'media':
          novosValoresHistorico = {
            valorFieam: (vFieamAntigo + vFieamNovo) / 2,
            valorSesi: (vSesiAntigo + vSesiNovo) / 2,
            valorSenai: (vSenaiAntigo + vSenaiNovo) / 2,
            valorIel: (vIelAntigo + vIelNovo) / 2,
            totalGeral: (totAntigo + totGeralNovo) / 2,
          };

          break;

        case 'manter':
          novosValoresHistorico = {
            valorFieam: vFieamNovo,
            valorSesi: vSesiNovo,
            valorSenai: vSenaiNovo,
            valorIel: vIelNovo,
            totalGeral: totGeralNovo,
          };

          break;
      }

      // 3.c) Atualiza o registro de histórico
      await prisma.historico.update({
        where: { id: historicoExistente.id },
        data: {
          ...novosValoresHistorico,
          dataAlteracao: new Date(),
        },
      });

      for (let i = 1; i <= 4; i++) {
        const chave = chavesPorInstituicao[i - 1];
        const valor = novosValoresHistorico[chave];
        try {
          await atualizarValor(i, valor, numericItemId, numericMes);
        } catch (err) {
          console.error("Falha ao atualizar instituição", i, err);
          return res.status(500).json({ message: "Erro interno ao atualizar valor." });
        }
      }

    } else {

      novosValoresHistorico = {
        valorFieam: vFieamNovo,
        valorSesi: vSesiNovo,
        valorSenai: vSenaiNovo,
        valorIel: vIelNovo,
        totalGeral: totGeralNovo,
      };

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
          usuarioId: req.usuario.id,
          dataAlteracao: new Date(),
        },
      });
    }

    for (let i = 1; i <= 4; i++) {
      const chave = chavesPorInstituicao[i - 1];
      const valor = novosValoresHistorico[chave];
      try {
        await atualizarValor(i, valor, numericItemId, numericMes);
      } catch (err) {
        console.error("Falha ao atualizar instituição", i, err);
        return res.status(500).json({ message: "Erro interno ao atualizar valor." });
      }
    }

    // Retorna resposta de sucesso
    return res.status(200).json({
      message: 'Valores atualizados com sucesso no Histórico e em valor_item.',
      historicoAtualizado: novosValoresHistorico,
    });
  } catch (error) {
    console.error('Erro ao atualizar valores do item:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar valores.' });
  }
};

const listarItens = async (req, res) => {

  const email = req.email;
  const perfilId = req.perfilId;

  const usuario = await prisma.usuario.findUnique({
    where: {
      email: email
    },
    select: {
      usuarioSetores: {
        select: {
          setorId: true,
        }
      }
    }
  })

  const setorIds = usuario.usuarioSetores.map(user => user.setorId)

  try {

    if (perfilId === 1) {
      const itensAdm = await prisma.item.findMany({
        include: {
          setor: {
            select: { nome: true, id: true }
          },
        },
        orderBy: {
          id: 'desc',
        },
      });

      res.status(200).json(itensAdm)

    } else {
      const itens = await prisma.item.findMany({
        where: {
          setor_id: {
            in: setorIds
          }
        },
        include: {
          setor: {
            select: { nome: true, id: true }
          },
        },
        orderBy: {
          id: 'desc',
        },
      });

      res.status(200).json(itens);
    }

  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({ error: 'Erro ao listar itens.' });
  }
};

const listarValorItens = async (req, res) => {
  const { id } = req.params;
  const { ano } = req.query;

  const indicadores = await prisma.item.findMany({
    where: {
      setor_id: Number(id),
      ano: Number(ano)
    },
    select: {
      nome: true,
      ano: true,
      setor_id: true,
      atividade: true,
      moeda: true,
      valores: {
        where: {
          valor: {
            not: 0
          }
        },
        select: {
          instituicao_id: true,
          mes: true,
          valor: true,
        }
      }
    }
  })

  res.json({ indicadores })
}

const buscarItemPorId = async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!item) return res.status(404).json({ error: 'Item não encontrado.' });

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar item.' });
  }
};

const atualizarItem = async (req, res) => {
  try {
    const { nome, detalhes, setorId, ano } = req.body;

    await prisma.item.update({
      where: { id: parseInt(req.params.id) },
      data: { nome, detalhes, setor_id: setorId, ano },
    });

    res.json({ message: 'Item atualizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar item.' });
  }
};

const excluirItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);

    await prisma.valor_item.deleteMany({
      where: { item_id: itemId },
    });

    await prisma.item.delete({
      where: { id: itemId },
    });

    res.json({ message: 'Item e valores excluídos com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  cadastrarItem,
  listarItens,
  buscarItemPorId,
  atualizarItem,
  excluirItem,
  listarValorItens,
  atualizarValoresItem
};
