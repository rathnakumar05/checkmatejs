# CheckMate: Data Validation Library

CheckMate is a data validation library that helps you validate and enforce rules on your data objects. It allows you to define validation rules and error messages for various data types and scenarios. Use CheckMate to simplify your data validation process.

## Installation

### Using npm

```bash
npm install checkmatejs
```
### Using cdn

```html
<script src="https://unpkg.com/checkmatejs/dist/CheckMate.min.js"></script>
```

### Usage npm

```js
// ES5
let CheckMate = require('checkmatejs');
```

```js
// ES6
import CheckMate from 'checkmatejs';
```

## Table of Contents
- [Type Castings](#type-castings)
- [Checkers Rules](#checkers-rules)
- [Schema Examples](#schema-examples)
  - [Basic Schema Example](#basic-schema-example)
  - [Schema Example with `require_with`](#schema-example-with-require_with)
  - [Schema Example with Custom Checkers](#schema-example-with-custom-checkers)

## Type Castings

1. `number`
2. `float`
3. `int`
4. `string`
5. `bool`

## Checker Rules

1. `required`
2. `min`
3. `max`
4. `true`
5. `false`
6. `alpha`
7. `num`
8. `alpha_num`
9. `alpha_num_free`
10. `email`
11. `url`
12. `phone`
13. `regex`
14. `allow_empty`

## Schema Examples

### Basic Schema Example

```javascript
var data = {
    name: "john"
};

var schema = {
    name: {
        rules: ["string", "required", "alpha_num_free"],
        label: "Name",
        message: {
            "required": "Name is required",
            "alpha_num_free": "Name must not contain special characters"
        },
        props: {
            selector: "name"
        },
        errorHandler: function(props) {
            // Handle errors
            // porps structure
            // {
            // messages: [ 'Name is required', .... ],  --> error messages in array
            // key: 'name', --> field_name or object key
            // data: { name: 'john' } --> data or input supplied 
            // }
        },
        successHandler: function(props) {
            // Handle non-errors
            //props structure
            // {
            // key: 'name', --> field_name or object key
            // data: { name: 'larry', phone: '+179834578' } --> data or input supplied 
            // }
        }
    }
};

var checkmate = new CheckMate(schema, data);
var { error, messages } = checkmate.check();

console.log(error, messages);
```

### Schema Example with require_with
```javascript
var data = {
    name: "larry",
    phone: "+179834578"
};

var schema = {
    name: {
        rules: ["string", "required", "alpha_num_free"],
        label: "Name",
        message: {
            "required": "Name is required",
            "alpha_num_free": "Name must not contain special characters"
        },
        props: {
            selector: "name"
        },
        errorHandler: function(props) {
            // Handle errors
            // porps structure
            // {
            // messages: [ 'Name is required', .... ],  --> error messages in array
            // key: 'name', --> field_name or object key
            // data: { name: 'larry', phone: '+179834578' } --> data or input supplied 
            // }
        },
        successHandler: function(props){
            // Handle non-errors
            //props structure
            // {
            // key: 'name', --> field_name or object key
            // data: { name: 'larry', phone: '+179834578' } --> data or input supplied 
            // }
        },
        async: false,
        require_with: {
            phone: {
                rules: ["string", "phone", "min:10", "max:16"]
            }
        }
    }
};

var checkmate = new CheckMate(schema, data);
var { error, messages } = checkmate.check();

console.log(error, messages);
```
### Schema Example with Custom Checkers
```javascript
var data = {
    "role" : "dev"
};

var schema = {
    role: {
        rules: ["string", "cu_check:enum"],
        cu_check: {
            enum: function(props) {
                // Custom checker logic
                // props structure
                // {
                //   current_value: 'dev', --> current value to check
                //   data: { role: 'dev' } --> data or input supplied
                // }
            }
        },
        messages: {
            "cu_check:enum": "Value must be 'dev' or 'admin' only"
        }
    }
};

var checkmate = new CheckMate(schema, data);
var { error, messages } = checkmate.check();

console.log(error, messages);
```

### Schema Example with regex BETA*
The regex checker is still in beta, but you can use it by providing a regex pattern as a string. This makes the checker a bit more challenging to use, so some compromises were made. For example, the `-` character needs to be passed at the end, like this: 'regex:/^[a-zA-Z0-9.!@%_:/,+''"\ -]$/'

```javascript
var data = {
    "role" : "dev"
};

var schema = {
    role: {
        rules: ["string", "cu_check:enum", "regex:/^[a-zA-Z0-9.!@%_:/,*+'\"\\\\ -]*$/"],
        cu_check: {
            enum: function(props) {
                // Custom checker logic
                // props structure
                // {
                //   current_value: 'dev', --> current value to check
                //   data: { role: 'dev' } --> data or input supplied
                // }
            }
        },
        messages: {
            "cu_check:enum": "Value must be 'dev' or 'admin' only",
            "regex": "Value is not a valid input"
        }
    }
};

var checkmate = new CheckMate(schema, data);
var { error, messages } = checkmate.check();

console.log(error, messages);
```

