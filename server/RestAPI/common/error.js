const ApplicationError = {
    InsufficientPriviliges: {
        "errorCode": "001",
        "errorMsg": "You do not have permission to access this resource."
    },
    MissingAuthentication: {
        "errorCode": "002",
        "errorMsg": "Missing authentication for priviliged function."
    },
    InvalidCredentials: {
        "errorCode": "003",
        "errorMsg": "The provided login credentials are invalid."
    },
    MalformedRequest: {
        "errorCode": "004",
        "errorMsg": "The server could not process the request as the data was not in expected format."
    },
    ResourceNonExistant: {
        "errorCode": "005",
        "errorMsg": "The requested resource could not be found."
    },
    DuplicateResource: {
        "errorCode": "006",
        "errorMsg": "Failed to create resource due to existing conflict."
    }
}

module.exports = {ApplicationError: ApplicationError};