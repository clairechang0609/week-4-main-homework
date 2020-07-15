const uuid = '9fbd3898-4d4d-4c65-a3cf-6af8511169fb';
const apiPath = 'https://course-ec-api.hexschool.io/api/';

//全域註冊(元件共用)
//pagination
Vue.component('pagination', {
    props: ['pages'],
    template: `#pagination`, //HTML 元素
    data() { //內層所有data都必須用function return
        return {}
    },
    methods: {
        //內emit推，外methods接收
        changePage(page) {
            this.$emit('changepage', page);
        },
    }
})
//topbar
Vue.component('topbar', {
    props: ['top'],
    template: `#topbar`, //HTML 元素
    data() {
        return {}
    },
    methods: {
        signout() {
            document.cookie = `HurleyHomeToken = ; expires = ; path=/`;
            window.location = 'index.html';
        }
    }
})

let app = new Vue({
    el: '.wrap',
    //區域註冊
    // components: {},
    data () {
        return {
            products: [],
            editProduct: {
                options: {},
                imageUrl: [],
            },
            newProduct: true,
            token: '',
            pagination: {},
        };
    },
    created() {
        this.token = document.cookie.replace(/(?:(?:^|.*;\s*)HurleyHomeToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        if (this.token === '') {
            window.location = 'index.html'; //取不到token值，返回登入畫面
        } else {
            this.getProducts();
        }
    },
    methods: {
        getProducts(page = 1) {
            const vm = this;
            const url = `${apiPath}${uuid}/admin/ec/products?page=${page}`;
            //預設帶入token
            axios.defaults.headers.common.Authorization = `Bearer ${vm.token}`;
            axios.get(url)
                .then( response => {
                    vm.products = response.data.data;
                    vm.pagination = response.data.meta.pagination;
                    console.log(vm.products);
                })
                .catch( error => {
                    console.log(error);
                })
        },
        openModal(mode, item) {
            switch (mode) {
                case 'new': //新增商品
                    this.newProduct = true;
                    this.editProduct = {
                        options: {
                            brand: '',
                        },
                        imageUrl: [],
                    };
                    document.querySelector('.form-wrap').classList.add('show');
                    break;
                case 'edit': //編輯
                    this.newProduct = false;
                    this.editProduct = JSON.parse(JSON.stringify(item)); //因添加options需深層複製
                    console.log(this.editProduct);
                    document.querySelector('.form-wrap').classList.add('show');
                    break;
                case 'delete': //刪除
                    this.editProduct = Object.assign({}, item);
                    document.querySelector('.delete-alert').classList.add('show');
            }
            document.querySelector('html').classList.add('shadow');
        },
        updateProduct() { //確認新增商品
            const vm = this;
            let url = '';
            let method = '';

            if (this.newProduct) { //新商品
                url = `${apiPath}${uuid}/admin/ec/product`;
                method = 'post'
            } else { //舊商品修改
                url = `${apiPath}${uuid}/admin/ec/product/${vm.editProduct.id}`;
                method = 'patch'
            }

            axios.defaults.headers.common.Authorization = `Bearer ${vm.token}`;

            axios[method](url, vm.editProduct)
                .then(() => {
                    vm.getProducts();
            })
                .catch((error) => {
                    console.log(error)
            });

            this.editProduct = { options: {}, imageUrl: [], };
            document.querySelector('.form-wrap').classList.remove('show');
            document.querySelector('html').classList.remove('shadow');
        },
        deleteProduct() { //確認刪除
            const vm = this;
            const url = `${apiPath}${uuid}/admin/ec/product/${vm.editProduct.id}`;
            axios.defaults.headers['Authorization'] = `Bearer ${vm.token}`;

            axios.delete(url)
                .then( response => {
                    vm.getProducts();
                })
                .catch( error => {
                    console.log(error);
                })
            
            this.editProduct = { options: {}, imageUrl: [], };
            document.querySelector('.delete-alert').classList.remove('show');
            document.querySelector('html').classList.remove('shadow');
        },
        closeForm() { //取消編輯
            document.querySelector('.form-wrap').classList.remove('show');
            document.querySelector('html').classList.remove('shadow');
            this.editProduct = { options: {}, imageUrl: [], };
        },
        cancelDelete() { //取消刪除
            document.querySelector('.delete-alert').classList.remove('show');
            document.querySelector('html').classList.remove('shadow');
            this.editProduct = { options: {}, imageUrl: [], };
        },
        uploadPic() { //使用上傳圖片方法
            const vm = this;
            //選取DOM中的檔案資訊
            const uploadfile = document.querySelector('#customPic').files[0];

            //轉成form data
            const formData = new FormData();
            formData.append('file', uploadfile);

            //路由、驗證
            const url = `${apiPath}${uuid}/admin/storage`;
            axios.defaults.headers.common.Authorization = `Bearer ${this.token}`;

            axios.post(url, formData, {
                header: { //聲明必須使用formData的格式(後端才能判斷)
                    'Content-Type': 'multipart/form-data',
                }
            })
                .then( response => {
                    vm.editProduct.imageUrl.push(response.data.data.path);
                    document.querySelector('#customPic').value = ''; //讓input清空
                })
                .catch( error => {
                    console.log(error);
                })
        }
    }
})