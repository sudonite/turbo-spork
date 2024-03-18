import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API } from "./Consts";

const instance = axios.create({
  baseURL: API,
  timeout: 600000,
});

instance.interceptors.request.use(async function (config) {
  if (config?.data instanceof FormData)
    Object.assign(config?.headers, { "Content-Type": "multipart/form-data" });

  const jwtToken = localStorage.getItem("jwt_token");
  if (jwtToken) {
    const decodedToken: any = jwtDecode(jwtToken);
    if (decodedToken && "exp" in decodedToken) {
      const expired = decodedToken.exp < new Date().getTime() / 1000;
      if (expired) {
        localStorage.removeItem("jwt_token");
        if (decodedToken.anonymous) {
          window.location.href = "http://172.17.0.2/products";
        } else {
          window.location.href = "http://172.17.0.2/login";
        }
      } else {
        config.headers.Authorization = `Bearer ${jwtToken}`;
      }
    }
  } else {
    const response = await fetch(API + "/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ mode: "anonymous" }),
    });
    const json = await response.json();
    localStorage.setItem("jwt_token", json.token);
    config.headers.Authorization = `Bearer ${json.token}`;
  }
  return config;
});

const login = async (data: any) => {
  try {
    const response = await instance.post("/login/", data);
    localStorage.setItem("jwt_token", response?.data?.token);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const register = async (data: any) => {
  try {
    const response = await instance.post("/register/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getProducts = async () => {
  try {
    const response = await instance.get("/product/");
    return { data: response?.data?.products, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getProduct = async (id: number) => {
  try {
    const response = await instance.get(`/product/${id}`);
    return { data: response?.data?.product, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getCategories = async () => {
  try {
    const response = await instance.get("/category/");
    return { data: response?.data?.categories, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const AddNewProduct = async (data: any) => {
  try {
    const response = await instance.post("/product/", data);
    return { data: response?.data?.product, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const AddNewCategory = async (data: any) => {
  try {
    const response = await instance.post("/category/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const DeleteCategory = async (data: any) => {
  try {
    const response = await instance.post("/category/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const DeleteProduct = async (data: any) => {
  try {
    const response = await instance.post("/product/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const ModifyProduct = async (data: any) => {
  try {
    const response = await instance.post("/product/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const AddToCart = async (data: any) => {
  try {
    const response = await instance.post("/cart/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getCart = async () => {
  try {
    const response = await instance.get("/cart/");
    return { data: response?.data?.orders, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const DeleteFromCart = async (data: any) => {
  try {
    const response = await instance.post("/cart/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const FinishCart = async (data: any) => {
  try {
    const response = await instance.post("/cart/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getProfile = async () => {
  try {
    const response = await instance.get("/profile/");
    return { data: response?.data, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const EditProfile = async (data: any) => {
  try {
    const response = await instance.post("/profile/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getAddress = async () => {
  try {
    const response = await instance.get("/address/");
    return { data: response?.data, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const EditAddress = async (data: any) => {
  try {
    const response = await instance.post("/address/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getShippings = async () => {
  try {
    const response = await instance.get("/shipping/");
    return { data: response?.data?.orders, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const DoneShipping = async (data: any) => {
  try {
    const response = await instance.post("/shipping/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const addFavorite = async (data: any) => {
  try {
    const response = await instance.post("/favorite/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const removeFavorite = async (data: any) => {
  try {
    const response = await instance.post("/favorite/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getOrders = async () => {
  try {
    const response = await instance.get("/orders/");
    return { data: response?.data?.orders, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getCoupons = async () => {
  try {
    const response = await instance.get("/coupon/");
    return { data: response?.data?.coupons, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const NewCoupon = async (data: any) => {
  try {
    const response = await instance.post("/coupon/", data);
    return { data: response?.data?.coupon, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const DeleteCoupon = async (data: any) => {
  try {
    const response = await instance.post("/coupon/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const ModifyCoupon = async (data: any) => {
  try {
    const response = await instance.post("/coupon/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const ValidateCoupon = async (data: any) => {
  try {
    const response = await instance.post("/coupon/", data);
    return { data: response?.data?.coupon, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getAdmins = async () => {
  try {
    const response = await instance.get("/admin/");
    return { data: response?.data?.profiles, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const setAdminPermissions = async (data: any) => {
  try {
    const response = await instance.post("/admin/", data);
    return { status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getStatistics = async () => {
  try {
    const response = await instance.get("/statistics/");
    return { data: response?.data?.statistics, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

const getProfileContext = async () => {
  try {
    const response = await instance.get("/context/");
    return { data: response?.data?.is_admin, status: response?.status };
  } catch (error: any) {
    return { status: error?.response?.status };
  }
};

export {
  login,
  register,
  getProducts,
  getProduct,
  getCategories,
  AddNewProduct,
  AddNewCategory,
  DeleteCategory,
  DeleteProduct,
  ModifyProduct,
  AddToCart,
  getCart,
  DeleteFromCart,
  FinishCart,
  getProfile,
  EditProfile,
  getAddress,
  EditAddress,
  getShippings,
  DoneShipping,
  addFavorite,
  removeFavorite,
  getOrders,
  getCoupons,
  NewCoupon,
  DeleteCoupon,
  ModifyCoupon,
  ValidateCoupon,
  getAdmins,
  setAdminPermissions,
  getStatistics,
  getProfileContext,
};
