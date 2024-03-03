const sql = require("../config/massageCentersDB");

//constructor

const MassageCenter = function(massageCenter) {
    this.id = massageCenter.id;
    this.name = massageCenter.name;
    this.tel = massageCenter.tel;
}

MassageCenter.getAll = result => {
    sql.query("SELECT * FROM massageCenters", (err, res) => {
        if(err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        console.log("massageCenters: ", res);
        result(null, res);
    });
};

module.exports = MassageCenter;