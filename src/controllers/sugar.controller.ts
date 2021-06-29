import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import db from './../config/database.config';
import Sugar from './../models/sugar.model';
import { updateValuesMixin, hasMealValueByType } from './../mixins/sugar.mixin';

/**
 * Create sugar object
 * @param req Request
 * @param res Response
 * @returns Object
 */
export function create(req: Request, res: Response) {
  const values: Array<any> = [];
  const token: string = req.headers['x-access-token'] as string;
  const user: any = jwt.verify(token, db.secret);

  if (!req.body.meal) {
    return res.status(400).send({
      message: 'Meal can not be empty!',
    });
  }

  if (req.body.meal == 1 && !req.body.mealCategory) {
    return res.status(400).send({
      message: 'Meal category can not be empty!',
    });
  }

  if (req.body.meal == 1 && !req.body.beforeAfter) {
    return res.status(400).send({
      message: 'Before/after value can not be empty!',
    });
  }

  if (!req.body.value) {
    return res.status(400).send({
      message: 'Value can not be empty!',
    });
  }
  else if (isNaN(req.body.value)) {
    return res.status(400).send({
      message: 'Value can only be a number!',
    });
  }
  else {
    if (req.body.meal == 1) {
      values.push(
        {
          type: 'before',
          value: req.body.beforeAfter == 0 ? req.body.value : '',
          createdAt: req.body.beforeAfter == 0 ? req.body.date : '',
        },
        {
          type: 'after',
          value: req.body.beforeAfter == 1 ? req.body.value : '',
          createdAt: req.body.beforeAfter == 1 ? req.body.date : '',
        }
      )
    }
  }

  const sugar = new Sugar({
    meal: req.body.meal,
    mealCategory: req.body.mealCategory ? req.body.mealCategory : null,
    value: (req.body.meal == 1) ? values : req.body.value,
    user: user.id,
    createdAt: moment(req.body.date),
    updatedAt: moment(req.body.date),
  });

  sugar.save()
    .then(data => {
      res.status(200).send({
        message: 'Sugar added successfully.',
        data: data
      });
    }).catch(err => {
      res.status(500).send({
        message: `${err.message} || Some error occured while creating the Sugar.`
      });
    });
};

/**
 * Update single value
 * @param req Request
 * @param res Response
 * @returns Object
 */
export function updateValue(req: Request, res: Response) {
  if (!req.body.value) {
    return res.status(400).send({
      message: 'Value can not be empty!',
    });
  }
  else if (isNaN(req.body.value)) {
    return res.status(400).send({
      message: 'Value can only be a number!',
    });
  }

  Sugar.findOneAndUpdate(
    { _id: req.params.sugarid },
    { $set: { 'value': [req.body.value] } },
    { overwrite: true }
  ).then((data: any) => {
    if (!data) {
      return res.status(404).send({
        message: `Sugar not found with id ${req.params.sugarid}`
      });
    }

    res.status(200).send({
      data: data
    });
  }).catch((err: any) => {
    return res.status(500).send({
      message: `${err.message} || Error retrieving sugar with id ${req.params.sugarid}`
    });
  });
};

/**
 * Update multiple values
 * @param req Request
 * @param res Response
 * @returns Object
 */
export async function updateValues(req: Request, res: Response) {
  const sugarid: String = req.params.sugarid;
  const beforeValue: Number = req.body.beforeValue;
  const afterValue: Number = req.body.afterValue;
  const date: Date = req.body.date;
  let response : any = {};

  if (!req.body.beforeValue || !req.body.afterValue) {
    return res.status(400).send({
      message: 'Value can not be empty!',
    });
  }
  else if (isNaN(req.body.beforeValue) || isNaN(req.body.afterValue)) {
    return res.status(400).send({
      message: 'Value can only be a number!',
    });
  }

  let checkBeforeValueByType: any = await hasMealValueByType(sugarid, 'before');
  let checkAfterValueByType: any = await hasMealValueByType(sugarid, 'after');

  if (checkBeforeValueByType == true) {
    let mixinResponse : any = await updateValuesMixin(sugarid, 'before', beforeValue);

    if (mixinResponse.data) {
      response['before'] = 'Update was successfull.';
    }
    else {
      response['before'] = mixinResponse.message;
    }
  }
  else {
    let mixinResponse : any = await updateValuesMixin(sugarid, 'before', beforeValue, date);

    if (mixinResponse.data) {
      response['before'] = 'Update was successfull.';
    }
    else {
      response['before'] = mixinResponse.message;
    }
  }

  if (checkAfterValueByType == true) {
    let mixinResponse : any = await updateValuesMixin(sugarid, 'after', afterValue);

    if (mixinResponse.data) {
      response['after'] = 'Update was successfull.';
    }
    else {
      response['after'] = mixinResponse.message;
    }
  }
  else {
    let mixinResponse : any = await updateValuesMixin(sugarid, 'after', afterValue, date);

    if (mixinResponse.data) {
      response['after'] = 'Update was successfull.';
    }
    else {
      response['after'] = mixinResponse.message;
    }
  }

  return res.status(200).send({
    message: response
  });
};

/**
 * Delete Sugar by id
 * @param req Request
 * @param res Response
 * @returns Object
 */
export function deleteSugarById(req: Request, res: Response) {
  Sugar.findByIdAndRemove(req.params.sugarid)
    .then((data: any) => {
      if (!data) {
        return res.status(404).send({
          message: `Sugar not found with id ${req.params.sugarid}`
        });
      }

      return res.status(200).send({
        message: 'Sugar deleted successfully.'
      });
    }).catch((err: any) => {
      return res.status(500).send({
        message: `${err.message} || Couldn't delete Sugar with id ${req.params.sugarid}`
      });
    });
};

/**
 * Get today values
 * @param req Request
 * @param res Response
 * @returns Object
 */
export function getValuesToday(req: Request, res: Response) {
  const user: any = jwt.verify(req.headers['x-access-token'] as string, db.secret);
  const userId: String = user.id;
  const begin = moment().startOf('day').format();
  const end = moment().endOf('day').format();

  Sugar.find({
    user: userId,
    createdAt: {
      $gte: begin,
      $lte: end,
    }
  })
    .then((data: any) => {
      if (!data) {
        return res.status(404).send({
          message: 'Not found data.'
        });
      }

      return res.status(200).send({
        data: data
      });
    }).catch((err: any) => {
      return res.status(500).send({
        message: err.message
      });
    });
};

/**
 * Get weekly values
 * @param req Request
 * @param res Response
 * @returns Object
 */
export function getValuesWeekly(req: Request, res: Response) {
  const user: any = jwt.verify(req.headers['x-access-token'] as string, db.secret);
  const begin = moment().subtract(7, 'days').startOf('day').format();
  const end = moment().endOf('day').format();

  Sugar.find({
    user: user.id,
    createdAt: {
      $gte: begin,
      $lte: end,
    }
  })
    .then((data: any) => {
      if (!data) {
        return res.status(404).send({
          message: 'Not found data.'
        });
      }

      return res.status(200).send({
        data: data
      });
    }).catch((err: any) => {
      return res.status(500).send({
        message: err.message
      });
    });
};

/**
 * Get values by datepicker
 * @param req Request
 * @param res Response
 * @returns Object
 */
export function getValues(req: Request, res: Response) {
  const user: any = jwt.verify(req.headers['x-access-token'] as string, db.secret);
  const begin = moment(req.param('begin')).format();
  const end = moment(req.param('end')).format();

  Sugar.find({
    user: user.id,
    createdAt: {
      $gte: begin,
      $lte: end,
    }
  })
    .then((data: any) => {
      if (!data) {
        return res.status(404).send({
          message: 'Not found data.'
        });
      }

      return res.status(200).send({
        data: data
      });
    }).catch((err: any) => {
      return res.status(500).send({
        message: err.message
      });
    });
};
