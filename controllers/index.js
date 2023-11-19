const { ROUTES } = require("../constants");
const { get, search } = require("../services");

module.exports = function (app) {
    app.get(ROUTES.BASE, get)
    app.post(ROUTES.SEARCH, search);
}
