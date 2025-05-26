const { pool, poolConnect } = require('../db');
// const sql = require('mssql');

const retornarDadosCrm = async (req, res) => {
    try {
        await poolConnect;

        const sqlPropostas = `
        SELECT
	        MONTH(createdon) AS Mes,
	        COUNT(*)		AS Total
        FROM crm.d_proposta
        WHERE YEAR(createdon) = 2025
        GROUP BY MONTH(createdon)
        ORDER BY MONTH(createdon);
        `

        const request = pool.request();

        const result = await request.query(sqlPropostas);

        return res.status(200).json(result.recordset)

    } catch (error) {
        console.log(error)
    }

}

module.exports = {
    retornarDadosCrm
}