const API_SERVER = "http://192.168.88.17:5009"

const ENDPOINTS = {
    AUTH:{
        REGISTER: API_SERVER + "/auth/register",
        LOGIN: API_SERVER + "/auth/login",
        REFRESH_TOKEN: API_SERVER + "/auth/refresh",
        LOGOUT: API_SERVER + "/auth/logout",
        LOGOUT_FROM_ALL_DEVICES: API_SERVER + "/auth/logout-from-all-devices",
        LOGOUT_FROM_ANOTHER_DEVICES: API_SERVER + "/auth/logout-from-another-devices",
        IS_AUTHORIZED: API_SERVER + "/auth/isAuthorized"
    },

    RECIPES: {
        SEARCH: API_SERVER + "/recipe/search",
        ADD: API_SERVER + "/recipe/add",
        UPDATE: API_SERVER + "/recipe/update",
        DELETE: API_SERVER + "/recipe/delete",
        ALL: API_SERVER + "/recipe/all",
        GET: API_SERVER + "/recipe"
    },

    USERS: {
        ALL: API_SERVER + "/users",
        INFO: API_SERVER + "/user",
        GET: API_SERVER + "/user/",
        DELETE: API_SERVER + "/user",
    },

    CATALOG:{
        GROUPS: API_SERVER + "/catalog/groups",
        CUISINES: API_SERVER + "/catalog/cuisines",
        NEWS: API_SERVER + "/catalog/news",
    },

    CUISINES:{
        ALL: API_SERVER + "/cuisines"
    },

    RECIPE_GROUPS:{
        ALL: API_SERVER + "/recipe-groups"
    },

    INGREDIENTS:{
        ALL: API_SERVER + "/ingredients"
    },

    IMAGE:{
        GET: API_SERVER + "/image"
    }
}

export default ENDPOINTS