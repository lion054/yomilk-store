
class storage {

    static set(key: any, cartItems: any) {
        localStorage.setItem(key, JSON.stringify(cartItems))
    }

    static get(key: any) {
        return JSON.parse(localStorage.getItem(key) || '{}')
    }
}

export default storage