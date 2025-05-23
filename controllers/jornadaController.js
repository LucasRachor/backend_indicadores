const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const retornarResumoSetor = async (req, res) => {
  const { setorId } = req.params;
  const { ano } = req.query;

  if (!ano) {
    return res.status(400).json({ error: "É obrigatório passar o ano como query param." });
  }

  try {
    const jornadas = await prisma.jornadaColaboradores.findMany({
      where: {
        setorId: Number(setorId),
        ano: Number(ano),
      },
      select: {
        mes: true,
        colaboradorId: true,
        valor: true,
      },
    });

    if (jornadas.length === 0) {
      return res.status(404).json({ error: "O setor não possui dados neste ano." });
    }

    const mapaPorMes = jornadas.reduce((mapa, { mes, colaboradorId, valor }) => {
      if (!mapa[mes]) {
        mapa[mes] = [];
      }
      mapa[mes].push({ colaboradorId, valor });
      return mapa;
    }, {});

    const resumosPorMes = Object.entries(mapaPorMes).map(([mesStr, listaJornadas]) => {
      const colaboradoresUnicos = new Set();
      let totalMinutos = 0;

      listaJornadas.forEach(({ colaboradorId, valor }) => {
        // 1) normaliza espaços: 
        const valorTrim = String(valor).trim();

        // 2) valida formato "HH:MM"
        if (!valorTrim || !/^\d{2}:\d{2}$/.test(valorTrim)) return;

        const [horasStr, minutosStr] = valorTrim.split(':');
        const horas = parseInt(horasStr, 10);
        const minutos = parseInt(minutosStr, 10);
        if (isNaN(horas) || isNaN(minutos)) return;

        colaboradoresUnicos.add(colaboradorId);
        totalMinutos += horas * 60 + minutos;
      });

      const totalHoras = Math.floor(totalMinutos / 60);
      const restoMinutos = totalMinutos % 60;
      const horasFormatado = `${String(totalHoras).padStart(2, '0')}:${String(restoMinutos).padStart(2, '0')}`;

      return {
        mes: Number(mesStr),
        indicadorProfissionais: 'Qtd. profissionais ativos no mês',
        colaboradores: colaboradoresUnicos.size,
        indicadorHoras: 'Qtd. de horas trabalhadas no setor',
        horasTrabalhadas: horasFormatado,
      };
    });

    resumosPorMes.sort((a, b) => a.mes - b.mes);

    return res.status(200).json({
      setorId: Number(setorId),
      ano: Number(ano),
      resumoPorMes: resumosPorMes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar dados do setor.' });
  }
};

const retornarJornadas = async (req, res) => {

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

      const jornada = await prisma.jornadaColaboradores.findMany({
        select: {
          id: true,
          dia: true,
          mes: true,
          ano: true,
          motivo: true,
          valor: true,
          criadoEm: true,
          atualizadoEm: true,
          colaborador: {
            select: {
              id: true,
              nome: true,
            },
          }
        }
      })

      res.status(200).json({ jornada })

    } else {
      const jornada = await prisma.jornadaColaboradores.findMany({
        where: {
          setorId: {
            in: setorIds
          }
        },
        select: {
          id: true,
          dia: true,
          mes: true,
          ano: true,
          motivo: true,
          valor: true,
          criadoEm: true,
          atualizadoEm: true,
          colaborador: {
            select: {
              id: true,
              nome: true,
            },
          }
        }
      })

      res.status(200).json({ jornada })
    }

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const editarJornada = async (req, res) => {

  const { id } = req.params;

  const { valor, motivo } = req.body

  try {
    const editar = await prisma.jornadaColaboradores.update({
      where: {
        id: Number(id)
      },
      data: {
        valor,
        motivo
      }
    })

    if (!editar) {
      res.status(400, "Erro ao editar jornada")
    }

    return res.status(200).json({ message: "Jornada editada com sucesso!" })

  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor!" })
  }
}

const criarJornada = async (req, res) => {

  const dataArray = req.body;

  try {

    const resultado = await prisma.jornadaColaboradores.createMany({
      data: dataArray,
      skipDuplicates: true,
    });

    if (resultado.count === 0) {

      return res
        .status(400)
        .json({ message: "Nenhuma jornada nova criada: todas já existem." });
    }

    return res.status(201).json({ message: "Jornadas cadastradas com sucesso!" });

  } catch (error) {

    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Jornada já cadastrada! " });
    }

    return res.status(500).json({ message: "Erro ao cadastrar jornadas." });

  }
};

module.exports = { editarJornada, retornarJornadas, retornarResumoSetor, criarJornada };