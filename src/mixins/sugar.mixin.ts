import Sugar from './../models/sugar.model';

/**
 * Update values mixin
 * @param sugarid String
 * @param type String
 * @param value Number
 * @param res Response
 */
export function updateValuesMixin(sugarid: String, type: String, value: Number, date?: Date) {
  type GenericObject = { [key: string]: any };
  let set: GenericObject = {};

  if (date) {
    set['value.$.createdAt'] = date;
  }

  set['value.$.value'] = value;

  return Sugar.findOneAndUpdate(
    { _id: sugarid, 'value.type': type },
    { $set: set },
    { overwrite: true }
  ).then((data: any) => {
    if (!data) {
      return {
        message: `Sugar not found with id ${sugarid}`
      };
    }

    return {
      data: data
    };
  }).catch((err: any) => {
    return {
      message: `${err.message} || Error retrieving sugar with id ${sugarid}`
    };
  });
};

/**
 * Has meal value by type
 * @param sugarid String
 * @param type String
 */
export function hasMealValueByType(sugarid: String, type: String) {
  let hasValueByType = false;

  return Sugar.findOne(
    { _id: sugarid, 'value.type': type }
  ).then((data: any) => {
    if (!data) {
      return hasValueByType;
    }

    for (let value in data.value) {
      if (data.value[value].type == type) {
        if (data.value[value].value) hasValueByType = true;
      }
    }

    return hasValueByType;
  }).catch(() => {
    return hasValueByType;
  });
};
