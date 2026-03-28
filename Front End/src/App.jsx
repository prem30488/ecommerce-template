import React from 'react';
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { NavbarMain } from "./components/navbarMain";
import { Shop } from "./pages/shop/shop";
import { Contact } from "./pages/Contact";
import { Cart } from "./pages/cart/cart";
import ProductDetailsCart from "./pages/productDetails/ProductDetailsCart";
import { ShopContextProvider } from "./context/shop-context";
import { WishlistContextProvider } from "./context/wishlist-context";
import Wishlist from "./pages/wishlist/wishlist";
import SharedWishlist from "./pages/wishlist/shared-wishlist";

import About from "./pages/About";
import Product from "./pages/Product";
import Notfound from "./pages/404";
import OurTeam from "./components/OurTeam";
import Footer from "./pages/Footer";
import ProductWomen from "./pages/ProductWomen";
import ProductKids from "./pages/ProductKids";
import CouponCode from './pages/checkout/CouponCode';
import AdvancedSearch from "./components/search/AdvancedSearch";
import BestSellersPage from "./pages/BestSellersPage";
import FeaturedPage from "./pages/FeaturedPage";
import { Component, useContext } from "react";
import { getCurrentUser } from './util/APIUtils';
import { ACCESS_TOKEN } from './constants/index';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import PropTypes from 'prop-types';
import Categorywise from './pages/Categorywise';
import Search from "./components/Search";
import Dashboard from './pages/admin/Dashboard';
import SignIn from './pages/admin/SignIn';
import UserManagementPage from './pages/admin/component/users/UserManagementPage';
import NavbarLoggedIn from './pages/admin/component/NavbarLoggedIn';
import CategoryManagementPage from './pages/admin/component/category/CategoryManagementPage';
import ProductManagementPage from './pages/admin/component/product/ProductManagementPage';
import FormManagementPage from './pages/admin/component/form/FormManagementPage';
import TestimonialManagementPage from './pages/admin/component/testimonial/TestimonialManagementPage';
import CouponManagementPage from './pages/admin/component/coupon/CouponManagementPage';
import OrderManagementPage from './pages/admin/component/orders/OrderManagementPage';
import SliderManagementPage from './pages/admin/component/slider/SliderManagementPage';
import LeadershipManagementPage from './pages/admin/component/leadership/LeadershipManagementPage';

import TaxInvoice from "./pages/checkout/TaxInvoice";


import RefundPolicy from './pages/RefundPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Shipping from './pages/Shipping';
import FormDialog from './pages/checkout/FormDialog';
import TrackOrder from './pages/TrackOrder';
import SockJsClient from 'react-stomp';

import Input from './chat/components/Input/Input';
import LoginForm from './chat/components/LoginForm';
import Messages from './chat/components/Messages/Messages';
import chatAPI from './chat/services/chatapi';
import { randomColor } from './chat/utils/common';
import { API_BASE_URL } from './constants/index'
const SOCKET_URL = API_BASE_URL + '/ws-chat/';
class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			messages: ' ',
			user: null,
			authenticated: false,
			currentUser: null,
			loading: false
		}

		this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this);
		this.handleLogout = this.handleLogout.bind(this);

		this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
	}
	loadCurrentlyLoggedInUser() {
		this.setState({
			loading: true
		});

		getCurrentUser()
			.then(response => {
				this.setState({
					currentUser: response,
					authenticated: true,
					loading: false
				});
			}).catch(error => {
				this.setState({
					loading: false
				});
			});
	}

	handleLogout() {
		localStorage.removeItem(ACCESS_TOKEN);
		this.setState({
			authenticated: false,
			currentUser: null
		});
		Alert.success("You're safely logged out!");
		window.location.reload();
	}

	componentDidMount() {
		this.loadCurrentlyLoggedInUser();
	}

	onConnected = () => {
		console.log("Connected!!")
	}

	onMessageReceived = (msg) => {
		console.log('New Message Received!!', msg);

		this.setState({
			messages: this.state.messages + msg,
		});
	}

	onSendMessage = (msgText) => {
		chatAPI.sendMessage(this.state.user.username, msgText).then(res => {
			console.log('Sent', res);
		}).catch(err => {
			console.log('Error Occured while sending message to api');
		})
	}

	handleLoginSubmit = (username) => {
		console.log(username, " Logged in..");

		this.setState(
			{
				user: {
					username: username,
					color: randomColor()
				}
			})

	}

	render() {
		return (
			<div className="App">
				<ShopContextProvider>
					<WishlistContextProvider>
						{this.state.authenticated ? <NavbarLoggedIn /> : <NavbarMain />}
						<Routes>
							<Route path="/" element={this.state.authenticated ? <Dashboard /> : <Shop />} />
							<Route path="/about" element={<About />} />
							<Route path="/contact" element={<Contact />} />
							<Route path="/productMen" element={<Product />} />
							<Route path="/productWomen" element={<ProductWomen />} />
							<Route path="/productKids" element={<ProductKids />} />
							<Route path="/bestsellers" element={<BestSellersPage />} />
							<Route path="/featured" element={<FeaturedPage />} />
							{/* <Route path="/cart" element={<Cart />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            {/* <Route path="/productdetails/:id" element={<ProductDetails />} /> */}
							<Route path="/productDetails/:id" element={<ProductDetailsCart />} />
							<Route path="*" element={<Notfound />} />
							<Route path="/cart" element={<Cart />} />
							<Route path="/checkout" element={<FormDialog />} />

							<Route path="/applyCoupon" element={<CouponCode />} />


							<Route path="/previewInvoice/:orderId" element={<TaxInvoice />} />

							<Route path="/byCategory/:id" element={<Categorywise />} />
							<Route path="/Search/:query" element={<Search />} />

							<Route path="/refundPolicy" element={<RefundPolicy />} />
							<Route path="/policies/refund-policy" element={<RefundPolicy />} />
							<Route path="/privacyPolicy" element={<PrivacyPolicy />} />

							<Route path="/policies/privacy-policy" element={<PrivacyPolicy />} />
							<Route path="/policies/terms-of-use" element={<TermsOfUse />} />
							<Route path="/shippinganddelievery" element={<Shipping />} />

							<Route exact path="/advancedSearch"
								element={<AdvancedSearch />} />
							<Route exact path="/trackOrder"
								element={<TrackOrder />} />
							{/*  ////////////////////////////////////////////// Admin Pages /////////////////////////////////////////////*/}

							<Route exact path="/SignIn" element={<SignIn />} />
							<Route exact path="/dashboard" element={<Dashboard />} />
							<Route exact path="/userManagement" element={<UserManagementPage />} />
							<Route exact path="/categoryManagement" element={<CategoryManagementPage />} />
							<Route exact path="/productManagement" element={<ProductManagementPage />} />
							<Route exact path="/formManagement" element={<FormManagementPage />} />
							<Route exact path="/testimonialManagement" element={<TestimonialManagementPage />} />
							<Route exact path="/couponManagement" element={<CouponManagementPage />} />
							<Route exact path="/orderManagement" element={<OrderManagementPage />} />
							<Route exact path="/sliderManagement" element={<SliderManagementPage />} />
							<Route exact path="/leadershipManagement" element={<LeadershipManagementPage />} />

							{/* Wishlist Routes */}
							<Route path="/wishlist" element={<Wishlist />} />
							<Route path="/your-wishlist" element={<Wishlist />} />
							<Route path="/wishlist/shared" element={<SharedWishlist />} />

						</Routes>
					</WishlistContextProvider>
				</ShopContextProvider>
				<Footer />
				<Alert stack={{ limit: 3 }}
					timeout={3000}
					position='top-right' effect='slide' offset={65} />
			</div>);

	};
}
App.propTypes = {
	messages: PropTypes.string,
	user: PropTypes.object,
	authenticated: PropTypes.bool,
	currentUser: PropTypes.object,
	loading: PropTypes.bool
};
export default App;

