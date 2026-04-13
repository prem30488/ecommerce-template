import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN } from '../constants';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Normalize URL: remove leading slash if it exists to avoid double slashes with baseURL
    if (config.url && config.url.startsWith('/') && config.baseURL) {
        config.url = config.url.substring(1);
    }
    
    return config;
}, error => {
    return Promise.reject(error);
});

api.interceptors.response.use(response => {
    return response.data;
}, error => {
    return Promise.reject(error.response ? error.response.data : error.message);
});

export function getCurrentUser() {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return api.get("/api/user/me");
}

export function getPrivileges(id) {
    return api.get("/api/user/privileges/" + id);
}

export function updatePrivileges(id, privileges) {
    return api.put("/api/user/privileges/update/" + id, privileges);
}

export function login(loginRequest) {
    return api.post("/api/auth/login", loginRequest);
}

export function signup(signupRequest) {
    return api.post("/api/auth/signup", signupRequest);
}

export function getUserList(page, size, search = '') {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    let url = "/api/user/users?page=" + page + "&size=" + size + "&sort=id";
    if (search) {
        url += "&search=" + encodeURIComponent(search);
    }
    return api.get(url);
}


export function getCategories(page, size, search = '') {
    let url = "/api/category/getCategories?page=" + page + "&size=" + size + "&sort=order,asc";
    if (search) {
        url += "&search=" + encodeURIComponent(search);
    }
    return api.get(url);
}

export function getActiveSales() {
    return api.get("/api/sale/active");
}

export function getAllSales() {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.get("/api/sale");
}

export function getSaleById(id) {
    return api.get(`/api/sale/${id}`);
}

export function getSaleImages(id) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.get(`/api/sale/images/${id}`);
}

export function uploadSaleImage(id, fileRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.post(`/api/sale/upload?saleId=${id}`, fileRequest, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export function createSale(saleRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.post("/api/sale", saleRequest);
}

export function updateSale(id, saleRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.put(`/api/sale/${id}`, saleRequest);
}

export function getSaleAnalytics(id) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.get(`/api/sale/${id}/analytics`);
}

export function fetchOrders(page, size) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.get("/api/order/getOrders?page=" + page + "&size=" + size + "&sort=id,desc");
}

export function updateOrderStatus(id, status) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.put("/api/order/updateStatus/" + id, { status });
}

export async function fetchMonthlySalesSum() {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    const res = await api.get("/api/order/getOrders?page=0&size=1000&sort=id,desc");
    const orders = res?.content || [];
    const months = { 'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0, 'Jul':0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0 };
    orders.forEach(o => {
        const d = new Date(o.createdAt || o.created_at);
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        if (months[monthName] !== undefined) {
             months[monthName] += parseFloat(o.total || 0);
        }
    });
    return { data: Object.keys(months).map(name => ({ name, sales: months[name] })) };
}

export async function fetchWeeklySalesSum() {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    const res = await api.get("/api/order/getOrders?page=0&size=1000&sort=id,desc");
    const orders = res?.content || [];
    const weeks = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };
    orders.forEach(o => {
        const d = new Date(o.createdAt || o.created_at);
        const date = d.getDate();
        const weekNum = Math.ceil(date / 7);
        const weekKey = `Week ${weekNum}`;
        if (weeks[weekKey] !== undefined) {
            weeks[weekKey] += parseFloat(o.total || 0);
        }
    });
    return { data: Object.keys(weeks).map(week => ({ week, sales: weeks[week] })) };
}

export async function fetchDailyRevenueSum() {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    const res = await api.get("/api/order/getOrders?page=0&size=1000&sort=id,desc");
    const orders = res?.content || [];
    const days = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
    orders.forEach(o => {
        const d = new Date(o.createdAt || o.created_at);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (days[dayName] !== undefined) {
             days[dayName] += parseFloat(o.total || 0);
        }
    });
    return { data: Object.keys(days).map(day => ({ day, revenue: days[day] })) };
}

export async function fetchDailyTransactionsCount() {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    const res = await api.get("/api/order/getOrders?page=0&size=1000&sort=id,desc");
    const orders = res?.content || [];
    const days = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
    orders.forEach(o => {
        const d = new Date(o.createdAt || o.created_at);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (days[dayName] !== undefined) {
             days[dayName] += 1;
        }
    });
    return { data: Object.keys(days).map(day => ({ day, transactions: days[day] })) };
}

export function getForms(page, size, search = '') {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    let url = "/api/forms/getForms?page=" + page + "&size=" + size + "&sort=id,asc";
    if (search) {
        url += "&search=" + encodeURIComponent(search);
    }
    return api.get(url);
}

export function getProducts(page, size) {
    return api.get("/api/product/getProducts?page=" + page + "&size=" + size + "&sort=id,desc");
}

export function getTestimonials(page, size, search = '') {
    let url = "/api/testimonial/getTestimonials?page=" + page + "&size=" + size + "&sort=id,desc";
    if (search) {
        url += "&search=" + encodeURIComponent(search);
    }
    return api.get(url);
}

export function getCoupons(page, size, search = '') {
    let url = "/api/coupon/getCoupon?page=" + page + "&size=" + size + "&sort=id,desc";
    if (search) {
        url += "&search=" + encodeURIComponent(search);
    }
    return api.get(url);
}
export const getSliders = (page, size, active, search = '') => {
    let url = "/api/slider/getSliders?page=" + page + "&size=" + size + "&sort=id,desc";
    if (active !== undefined) {
        url += "&active=" + active;
    }
    if (search) {
        url += "&search=" + encodeURIComponent(search);
    }
    return api.get(url);
}

export function addSlider(sliderRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.post("/api/slider/createSlider", sliderRequest);
}

export function updateSlider(sliderRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.put("/api/slider/" + sliderRequest.id, sliderRequest);
}

export function deleteSlider(id) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/slider/delete/" + id);
}

export function undeleteSlider(id) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/slider/undelete/" + id);
}

export function fetchSliderById(id) {
    return api.get("/api/slider/fetchById/" + id);
}


export async function getCategoriesShort() {
    return api.get("/api/category/getCategories?page=0&size=1000&sort=id&sort=order,asc");
}

export function getOffersByProductId(productId) {

    return api.get("/api/offer/getOffersByProductId/" + productId);
}

export function getAllOffers(page, size) {
    return api.get("/api/offer/getOffers?page=" + page + "&size=" + size + "&sort=id,asc");
}

export function addCategory(categoryRequest) {

    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return api.post("/api/category/createCategory", categoryRequest);
}

export function addTestimonialImage(fileRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.post("/api/testimonial/upload", fileRequest, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export function addForm(formRequest) {

    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.post("/api/forms/createForms", formRequest);
}

export function addTestimonial(formRequest) {

    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.post("/api/testimonial/createTestimonial", formRequest);
}

export function addCoupon(formRequest) {

    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.post("/api/coupon/createCoupon", formRequest);
}


export function addOffer(offerRequest) {
    console.log(JSON.stringify(offerRequest));
    return api.post("/api/offer/createOffer", offerRequest);
}

export function addUser(userRequest) {
    console.log(JSON.stringify(userRequest));
    return api.post("/api/user/users", userRequest);
}

export function updateUser(userRequest) {
    return api.put("/api/user/users/" + userRequest.id, userRequest);
}

export function updateRole(id, role) {
    return api.get("/api/user/profile/updateRole/" + id + "/" + role);
}

export function deleteUser(id) {
    return api.get("/api/user/deleteUser/" + id);
}

export function deleteCategory(id) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/category/delete/" + id);
}


export function updateGeneralProfile(profileRequest) {
    return api.put("/api/user/profile/" + profileRequest.id, profileRequest);
}




export function fetchUserById(id) {
    return api.get("/api/user/users/" + id);
}

export function fetchCategoryById(id) {
    return api.get("/api/category/fetchById/" + id);
}

export function fetchFormById(id) {
    return api.get("/api/forms/fetchById/" + id);
}

export function fetchProductById(id) {
    return api.get("/api/product/fetchById/" + id);
}


export function fetchGeneralProfileById(id) {
    return api.get("/api/user/profile/" + id);
}


export function updateCategory(categoryRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.put("/api/category/" + categoryRequest.id, categoryRequest);
}


export function updateProduct(productRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.put("/api/product/" + productRequest.id, productRequest);
}

export function addProduct(productRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.post("/api/product/createProduct", productRequest);
}

export function updateForm(itemRequest) {
    return api.put("/api/forms/" + itemRequest.id, itemRequest);
}

export function deleteOffer(offerId) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/offer/delete/" + offerId);
}

export function deleteForm(itemRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/forms/delete/" + itemRequest.id, { data: itemRequest });
}

export function undeleteForm(itemRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/forms/undelete/" + itemRequest.id, { data: itemRequest });
}

export function deleteTestimonial(itemRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/testimonial/delete/" + itemRequest.id, { data: itemRequest });
}

export function undeleteTestimonial(itemRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/testimonial/undelete/" + itemRequest.id, { data: itemRequest });
}

export function deleteCoupon(itemRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/coupon/delete/" + itemRequest.id, { data: itemRequest });
}

export function undeleteCoupon(itemRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/coupon/undelete/" + itemRequest.id, { data: itemRequest });
}

export function deleteProduct(itemRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/product/delete/" + itemRequest.id, { data: itemRequest });
}

export function hardDeleteProduct(id) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/product/delete/" + id + "?hard=true");
}

export function undeleteProduct(itemRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/product/undelete/" + itemRequest.id, { data: itemRequest });
}


export function fetchOverviewById(id) {
    return api.get("/api/user/overviews/" + id);
}

export function getMissionList() {
    return api.get("/api/user/missions?page=0&size=10&sort=id");
}

export function addMission(missionRequest) {
    return api.post("/api/user/missions", missionRequest);
}

export function updateMission(missionRequest) {
    return api.put("/api/user/missions/" + missionRequest.id, missionRequest);
}

export function fetchMissionById(id) {
    return api.get("/api/user/missions/" + id);
}

export function getLeadershipList() {
    return api.get("/api/user/leaderships?page=0&size=10&sort=id");
}

export function addLeadership(leadershipRequest) {
    return api.post("/api/user/leaderships", leadershipRequest);
}

export function updateLeadership(leadershipRequest) {
    return api.put("/api/user/leaderships/" + leadershipRequest.id, leadershipRequest);
}

export function fetchLeadershipById(id) {
    return api.get("/api/user/leaderships/" + id);
}

export function getAwardList() {
    return api.get("/api/user/awards?page=0&size=10&sort=id");
}

export function addAward(awardRequest) {
    return api.post("/api/user/awards", awardRequest);
}

export function updateAward(awardRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.put("/api/user/awards/" + awardRequest.id, awardRequest);
}

export function fetchAwardById(id) {
    return api.get("/api/user/awards/" + id);
}

export function getTestimonialList() {
    return api.get("/api/user/testimonials?page=0&size=10&sort=id");
}


export function updateTestimonial(testimonialRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.put("/api/testimonial/" + testimonialRequest.id, testimonialRequest);
}

export function updateCoupon(testimonialRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.put("/api/coupon/" + testimonialRequest.id, testimonialRequest);
}

export function fetchTestimonialById(id) {
    return api.get("/api/user/testimonials/" + id);
}

export function fetchSolrEntitiesDesc(page, size) {
    return api.get("/api/solrSearchEntity/getAll?page=" + page + "&size=" + size + "&sort=id,desc");
}

export function fetchSolrEntitiesViewedDesc(page, size) {
    return api.get("/api/solrSearchEntity/getAllViewedMe?page=" + page + "&size=" + size + "&sort=id,desc");
}

export function fetchSolrEntitiesViewedNotShortlistedDesc(page, size) {
    return api.get("/api/solrSearchEntity/getAllViewedMeNotShortlisted?page=" + page + "&size=" + size + "&sort=id,desc");
}

export function fetchSolrEntitiesShortlistedDesc(page, size) {
    return api.get("/api/solrSearchEntity/getAllShortlisted?page=" + page + "&size=" + size + "&sort=id,desc");
}

export function fetchByMaritalStatus(maritalStatus, page, size, orderBy) {
    return api.post("/api/solrSearchEntity/findByMaritalStatusIn?page=" + page + "&size=" + size + "&sort=" + orderBy + ",desc", { data: [{ maritalStatus }] });
}

export function fetchByMotherTounge(motherTounge, page, size, orderBy) {
    return api.post("/api/solrSearchEntity/findByMotherToungeIn?page=" + page + "&size=" + size + "&sort=" + orderBy + ",desc", { data: [{ motherTounge }] });
}

export function fetchByEducation(education, page, size, orderBy) {
    return api.post("/api/solrSearchEntity/findByEducationIn?page=" + page + "&size=" + size + "&sort=" + orderBy + ",desc", { data: [{ education }] });
}

export function fetchByOccupation(occupation, page, size, orderBy) {
    return api.post("/api/solrSearchEntity/findByOccupationIn?page=" + page + "&size=" + size + "&sort=" + orderBy + ",desc", { data: [{ occupation }] });
}

export function fetchByPhysicalStatus(physicalStatus, page, size, orderBy) {
    return api.post("/api/solrSearchEntity/findByPhysicalStatusIn?page=" + page + "&size=" + size + "&sort=" + orderBy + ",desc", { data: [{ physicalStatus }] });
}

export function fetchByDiet(diet, page, size, orderBy) {
    return api.post("/api/solrSearchEntity/findByDietIn?page=" + page + "&size=" + size + "&sort=" + orderBy + ",desc", { data: [{ diet }] });
}

export function fetchBySmoke(smoke, page, size, orderBy) {
    return api.post("/api/solrSearchEntity/findBySmokeIn?page=" + page + "&size=" + size + "&sort=" + orderBy + ",desc", { data: [{ smoke }] });
}

export function fetchByDrink(drink, page, size, orderBy) {
    return api.post("/api/solrSearchEntity/findByDrinkIn?page=" + page + "&size=" + size + "&sort=" + orderBy + ",desc", { data: [{ drink }] });
}

export function fetchWeeklyCount() {
    return api.get("/api/user/users/weekly");
}

export function fetchMonthlyCount() {
    return api.get("/api/user/users/monthly");
}

export function countwithImage() {
    return api.get("/api/user/users/countwithImage");
}

export function isShortlisted(id) {
    return api.post("/api/user/profile/isShortlisted", { id });
}

export function shortlist(id) {
    return api.post("/api/user/profile/shortlist", { id });
}

export function view(id) {
    return api.post("/api/user/profile/view", { id });
}

export function getWeeklyEntities(page, size, sort) {
    return api.get("/api/solrSearchEntity/getWeeklyEntities?page=" + page + "&size=" + size + "&sort=" + sort + "");
}

export function getMonthlyEntities(page, size, sort) {
    return api.get("/api/solrSearchEntity/getMonthlyEntities?page=" + page + "&size=" + size + "&sort=" + sort + "");
}

export function findByImageUrl(page, size, sort) {
    return api.get("/api/solrSearchEntity/findByImageUrlIsNotNullOrderByIdDesc?page=" + page + "&size=" + size + "&sort=" + sort + "");
}


export function getLeadershipTeams(page, size, search = '') {
    let url = "/api/leadership/getTeams?page=" + page + "&size=" + size;
    if (search) {
        url += "&search=" + encodeURIComponent(search);
    }
    return api.get(url);
}


export function addLeadershipTeam(teamRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.post("/api/leadership/create", teamRequest);
}

export function updateLeadershipTeam(teamRequest) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.put("/api/leadership/" + teamRequest.id, teamRequest);
}

export function deleteLeadershipTeam(id) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    return api.delete("/api/leadership/delete/" + id);
}

export function uploadLeadershipImage(file) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    const formData = new FormData();
    formData.append('file', file);
    return api.post("/api/leadership/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export function uploadSliderImage(file) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }
    const formData = new FormData();
    formData.append('file', file);
    return api.post("/api/slider/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}
export function createOrder(orderRequest) {
    return api.post("/api/order/createOrder", orderRequest);
}

export function verifyPayment(verifyRequest) {
    return api.post("/api/payment/verify", verifyRequest);
}
