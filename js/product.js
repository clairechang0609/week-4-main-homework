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
            products: [
                {
                    id: 1586934917210,
                    category: 'Lighting',
                    title: '夜巡桌燈',
                    origin_price: 10000,
                    price: 8500,
                    description: '直徑 13.5 x 高 24.5 公分',
                    content: '手把不僅方便移動，同時也是美感造型之一。可以作為床頭燈、情境燈、或是取代蠟燭光源，營造浪漫氛圍。',
                    is_enabled: true,
                    unit: '盞',
                    options: {
                        brand: 'MENU'
                    },
                    imageUrl: [
                        'https://shoplineimg.com/5cd8dc7015c0710001011ee2/5d5bc7beb19ace0014165345/800x.webp?source_format=jpg' 
                    ]
                }, {
                    id: 1196934917910,
                    category: 'Lighting',
                    title: '封光吊燈',
                    origin_price: 11900,
                    price: 10000,
                    description: '直徑 32.5 x 高 29.5 公分',
                    content: '防眩光的霧面燈罩，不僅能夠照亮您的餐桌或是吧台，也能散發柔和的光線，溫暖整個空間。',
                    is_enabled: true,
                    unit: '盞',
                    options: {
                        brand: 'Muuto'
                    },
                    imageUrl: [
                        'https://shoplineimg.com/5cd8dc7015c0710001011ee2/5d86c7208f9bfc3ebeef30c4/800x.webp?source_format=jpg'
                    ]
                }
            ],
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
            axios.defaults.headers.common.Authorization = `Bearer ${this.token}`;
            axios.get(url)
                .then( response => {
                    console.log(response.data);
                    response.data.data.forEach(item => {
                        vm.products.push({
                            id: item.id,
                            category: item.category,
                            title: item.title,
                            origin_price: item.origin_price,
                            price: item.price,
                            description: item.description,
                            content: item.content,
                            is_enabled: true,
                            unit: item.unit,
                            options: {
                                brand: 'unknow'
                            },
                            imageUrl: item.imageUrl
                        })
                    });
                    vm.pagination = response.data.meta.pagination;
                    console.log(vm.pagination);
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
                    document.querySelector('.form-wrap').classList.add('show');
                    break;
                case 'delete': //刪除
                    this.editProduct = Object.assign({}, item);
                    document.querySelector('.delete-alert').classList.add('show');
            }
            document.querySelector('html').classList.add('shadow');
        },
        updateProduct() { //確認新增商品
            if (this.newProduct) { //新商品
                this.editProduct.id = new Date().getTime();
                this.products.push(this.editProduct);
            } else {
                this.products.forEach((item, i) => {
                    if (item.id === this.editProduct.id) {
                        this.$set(this.products, i, this.editProduct); //沒有預先定義的物件
                    }
                });
            }
            this.editProduct = { options: {}, imageUrl: [], };
            document.querySelector('.form-wrap').classList.remove('show');
            document.querySelector('html').classList.remove('shadow');
        },
        deleteProduct() { //確認刪除
            this.products.forEach((item, i) => {
                if (item.id === this.editProduct.id) {
                    this.products.splice(i, 1);
                }
            });
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