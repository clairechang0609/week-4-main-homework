const url = 'https://course-ec-api.hexschool.io/api/';

let app = new Vue({
    el: '.wrap',
    data() {
        return {
            user: {
                email: '',
                password: ''
            },
            token: ''
        };
    },
    methods: {
        signin() {
            const api = `${url}auth/login`; //登入網址
            axios.post(api, this.user)
                .then( response => {
                    const token = response.data.token;
                    const expired = response.data.expired; //到期日

                    document.cookie = `HurleyHomeToken = ${token}; expires = ${ new Date(expired * 1000) }; path=/`; //path可寫可不寫
                    window.location = 'product.html';
                })
                .catch( error => {
                    console.log(error);
                })
        }
    }
})