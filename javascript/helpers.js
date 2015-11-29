Handlebars.registerHelper('compare', function(lvalue, operator, rvalue, options) {
  if (arguments.length < 3) {
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
  }

  if (options === undefined) {
    options = rvalue;
    rvalue = operator;
    operator = "==";
  }

  switch (operator) {
    case '==':
      return (lvalue == rvalue) ? options.fn(this) : options.inverse(this);
    case '===':
      return (lvalue === rvalue) ? options.fn(this) : options.inverse(this);
    case '<':
      return (lvalue < rvalue) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (lvalue <= rvalue) ? options.fn(this) : options.inverse(this);
    case '>':
      return (lvalue > rvalue) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (lvalue >= rvalue) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (lvalue && rvalue) ? options.fn(this) : options.inverse(this);
    case '||':
      return (lvalue || rvalue) ? options.fn(this) : options.inverse(this);
    case '!=':
      return (lvalue != rvalue) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }

});
