class CustomError extends Error{
    constructor(message,code){
        super(message);
        this.customCode = code;
    }
    set code(code){
        this.customCode = code;
    }
    get code(){
        return this.customCode;
    }
}

module.exports = CustomError;