const CheckMate = require("../src/index");

test("require_with", () => {
    var data = {
        name: "larry",
        phone: "+1798345"
    };
    
    var schema = {
        name: {
            rules: ["string", "required", "alpha_num_free"],
            label: "Name",
            messages: {
                "required": "Name is required",
                "alpha_num_free": "Name must not contains special characters"
            },
            props: {
                selector: "name"
            },
            errorHandler: function(props) {

            },
            async: false, 
            require_with: {
                phone: {
                    rules: ["string", "phone", "min:10", "max:16"],
                    async: false,
                },
            }
        }
    }
    
    var checkmate = new CheckMate(schema, data);
    var { error, messages } = checkmate.check();
    expect(error).toBe(true);
})



