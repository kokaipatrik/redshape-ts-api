import { Application } from 'express';
import { create, updateValue, updateValues, deleteSugarById, getValuesToday, getValuesWeekly, getValues } from './../controllers/sugar.controller';
import { verifyToken } from './../middlewares/user.middleware';
import { userPermission } from './../middlewares/sugar.middleware';

module.exports = (app: Application) => {
    app.post(
        '/create',
        verifyToken,
        create);

    app.post(
        '/update-value/:sugarid',
        [verifyToken, userPermission],
        updateValue);

    app.post(
        '/update-values/:sugarid',
        [verifyToken, userPermission],
        updateValues);

    app.delete(
        '/delete/:sugarid',
        [verifyToken, userPermission],
        deleteSugarById);

    app.get(
        '/values/today',
        verifyToken,
        getValuesToday);

    app.get(
        '/values/weekly',
        verifyToken,
        getValuesWeekly);

    app.get(
        '/values/custom',
        verifyToken,
        getValues);
}
