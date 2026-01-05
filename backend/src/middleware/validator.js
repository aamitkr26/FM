"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validate = void 0;
var _zod = require("zod");
const validate = schema => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    if (parsed && typeof parsed === 'object') {
      if ('body' in parsed && parsed.body !== undefined) req.body = parsed.body;
      if ('query' in parsed && parsed.query !== undefined) req.query = parsed.query;
      if ('params' in parsed && parsed.params !== undefined) req.params = parsed.params;
    }
    next();
  } catch (err) {
    if (err instanceof _zod.ZodError) {
      res.status(400).json({
        message: 'Validation error',
        issues: err.issues
      });
      return;
    }
    next(err);
  }
};
exports.validate = validate;