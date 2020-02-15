
export const obj_has = (obj, key)=> (
  // eslint-disable-next-line prefer-reflect
  Object.prototype.hasOwnProperty.call(obj, key)
);
