const messages = {
  required: "{label} is required.",
  min: {
    min_len: "Minimum length required is {min} characters.",
    min_val: "Minimum value required is {min}.",
  },
  max: {
    max_len: "Maximum length required is {max} characters.",
    max_val: "Maximum value required is {max}.",
  },
  true: "{label} must be true or 1",
  false: "{label} must be false or 0",
  alpha: "{label} must be alphabets only",
  num: "{label} must be numbers only",
  alpha_num: "{label} must be alphabets and numbers only",
  alpha_num_free:
    "{label} allowed characters are alphabets, numbers and ?'\"!-+@%#_*()",
  url: "{label} must be valid url",
  phone: "{label} must be valid phone number",
  email: "{label} must be valid email",
  regex: "{label} must match this regex pattern {regex}",
  regex_pattern: "{label} must match this regex pattern {regex}",
};

module.exports = messages;
