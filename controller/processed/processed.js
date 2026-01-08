const Processed = require("../../models/processed")

exports.create = async (req, res) => {
    try {
        const { nofile, filetype, link, userid } = req.body;
        const processed = await Processed.create({
            nofile,
            filetype,
            link,
            userid
        });
        return res.status(200).json({ message: 'Updated Successfully.', processed });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.getProcessed = async (req, res) => {
    try {


        // 1️⃣ Total nofile sum
        const totalNofileResult = await Processed.aggregate([
            { $group: { _id: null, totalNofile: { $sum: "$nofile" } } }
        ]);
        const totalNofile = totalNofileResult[0]?.totalNofile || 0;

        // 2️⃣ Total nofile sum where filetype = pdf
        const pdfNofileResult = await Processed.aggregate([
            { $match: { filetype: "pdf" } },
            { $group: { _id: null, pdfNofile: { $sum: "$nofile" } } }
        ]);
        const pdfNofile = pdfNofileResult[0]?.pdfNofile || 0;

        return res.status(200).json({
            message: "Find Successfully.",
            totalNofile,     // sum of nofile across all docs
            pdfNofile,       // sum of nofile for filetype = pdf
        
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

