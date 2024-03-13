import { useState, useEffect } from "react";

import { PhotoURL } from "@/Consts";

import Navbar from "@/components/NavBar";
import { Line, Pie, Bar } from "react-chartjs-2";
import { ScrollBar, ScrollArea } from "@/components/ui/scroll-area";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  AddNewProduct,
  AddNewCategory,
  getCategories,
  DeleteCategory,
  DeleteProduct,
  getProducts,
  ModifyProduct,
  getCoupons,
  NewCoupon,
  DeleteCoupon,
  ModifyCoupon,
  getShippings,
  DoneShipping,
  getAdmins,
  setAdminPermissions,
  getStatistics,
} from "@/API";
import { Switch } from "@/components/ui/switch";

const Admin = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [showed, setShowed] = useState<any>(true);
  const [picture, setPicture] = useState<File | null>(null);

  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState<any>({ code: "", discount: "" });
  const [modifyCoupon, setModifyCoupon] = useState<any>({
    code: "",
    discount: "",
  });

  const [avaiableCategories, setAvaiableCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [avaiableProducts, setAvaiableProducts] = useState<any[]>([]);

  const [modifyProduct, setModifyProduct] = useState({
    id: 0,
    name: "",
    description: "",
    price: "",
    quantity: "",
    showed: true as any,
    categories: [] as string[],
  });

  const [shippings, setShippings] = useState<any>([]);
  const [admins, setAdmins] = useState<any>([]);
  const [modifyAdmins, setModifyAdmins] = useState<any>([]);
  const [statistics, setStatistics] = useState<any>({});

  const { toast } = useToast();

  useEffect(() => {
    const getData = async () => {
      const categories = await getCategories();
      const products = await getProducts();
      const coupons = await getCoupons();
      const shippings = await getShippings();
      const admins = await getAdmins();
      const statistics = await getStatistics();
      console.log(statistics?.data);

      if (
        categories?.status === 200 &&
        products?.status === 200 &&
        coupons?.status === 200 &&
        shippings?.status === 200 &&
        admins?.status === 200 &&
        statistics?.status === 200
      ) {
        setAvaiableCategories(categories?.data);
        setAvaiableProducts(products?.data);
        setCoupons(coupons?.data);
        setShippings(shippings?.data);
        setAdmins(admins?.data);
        setModifyAdmins(admins?.data);
        setStatistics(statistics?.data);
      } else {
        toast({
          title: "Hiba",
          description: "Sikertelen adatlekérés",
        });
      }
    };
    getData();
  }, []);

  interface ComparableObject {
    [key: string]: any;
  }

  function areArraysEqual<T extends ComparableObject>(
    arr1: T[],
    arr2: T[]
  ): boolean {
    if (arr1.length !== arr2.length) return false;

    const mapper = (obj: ComparableObject): Record<string, unknown> =>
      Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
          acc[key] = obj[key];
          return acc;
        }, {} as Record<string, unknown>);

    return arr1.every((el1) => {
      const el2 = arr2.find(
        (e) => JSON.stringify(mapper(el1)) === JSON.stringify(mapper(e))
      );
      return !!el2;
    });
  }

  const handleAddNewProduct = async () => {
    if (!name || !description || !price || !quantity || !picture) {
      toast({
        title: "Hiányzó adatok",
        description: "Töltse ki az összes mezőt",
      });
      return;
    }

    const formData = new FormData();

    formData.append("action", "new");
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("showed", showed);
    formData.append("quantity", quantity);
    formData.append("categories", JSON.stringify(categories));

    if (picture) {
      formData.append("picture", picture);
    }

    const response = await AddNewProduct(formData);

    if (response.status === 200) {
      setAvaiableProducts([...avaiableProducts, response?.data]);
      toast({
        title: "Sikeresen hozzáadva",
        description: "Sikeresen hozzáadta az új terméket",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Sikertelen hozzáadás",
      });
    }
  };

  const handleAddNewCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount) {
      toast({
        title: "Hiányzó adatok",
        description: "Töltse ki az összes mezőt",
      });
      return;
    }
    if (newCoupon.discount < 0 || newCoupon.discount > 100) {
      toast({
        title: "Hibás adat",
        description: "A kedvezmény 0 és 100 közötti szám lehet",
      });
      return;
    }
    const data = {
      action: "new",
      code: newCoupon.code,
      discount: newCoupon.discount,
    };
    const response = await NewCoupon(data);
    if (response.status === 200) {
      setCoupons([...coupons, response.data]);
      setNewCoupon({ code: "", discount: "" });
      toast({
        title: "Sikeresen hozzáadva",
        description: "Sikeresen hozzáadta az új kupont",
      });
    } else if (response.status === 409) {
      toast({
        title: "Létező kód",
        description: "Ez a kód már létezik",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Sikertelen hozzáadás",
      });
    }
  };

  const handleDeleteCoupon = async (coupon_id: number) => {
    const data = {
      action: "delete",
      coupon_id: coupon_id,
    };
    const response = await DeleteCoupon(data);
    if (response.status === 200) {
      setCoupons(coupons.filter((item) => item.id !== coupon_id));
      toast({
        title: "Sikeresen törölve",
        description: "Sikeresen törölte a kupont",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Sikertelen törlés",
      });
    }
  };

  const handleModifyCoupon = async () => {
    if (!modifyCoupon.code || !modifyCoupon.discount) {
      toast({
        title: "Hiányzó adatok",
        description: "Töltse ki az összes mezőt",
      });
      return;
    }
    if (modifyCoupon.discount < 0 || modifyCoupon.discount > 100) {
      toast({
        title: "Hibás adat",
        description: "A kedvezmény 0 és 100 közötti szám lehet",
      });
      return;
    }
    const data = {
      action: "edit",
      coupon_id: modifyCoupon.id,
      code: modifyCoupon.code,
      discount: modifyCoupon.discount,
    };

    const response = await ModifyCoupon(data);
    if (response.status === 200) {
      setCoupons([
        ...coupons.map((item) => {
          if (item.id !== modifyCoupon.id) {
            return { ...item };
          } else {
            return { ...modifyCoupon };
          }
        }),
      ]);
      toast({
        title: "Sikeresen módosítva",
        description: "Sikeresen módosította a kupont",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Sikertelen módosítás",
      });
    }
  };

  const handleAddNewCategory = async () => {
    const data = {
      action: "new",
      name: newCategory,
    };
    const response = await AddNewCategory(data);
    if (response.status === 200) {
      setAvaiableCategories([...avaiableCategories, newCategory]);
      toast({
        title: "Sikeresen hozzáadva",
        description: "Sikeresen hozzáadta az új kategóriát",
      });
    } else if (response.status === 409) {
      toast({
        title: "Létező kategória",
        description: "Ez a kategória már létezik",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Sikertelen hozzáadás",
      });
    }
    setNewCategory("");
  };

  const handleDeleteCategory = async (category: string) => {
    const data = {
      action: "delete",
      name: category,
    };
    const response = await DeleteCategory(data);
    if (response.status === 200) {
      setAvaiableCategories(
        avaiableCategories.filter((item) => item !== category)
      );
      toast({
        title: "Sikeresen törölve",
        description: "Sikeresen törölte a kategóriát",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Sikertelen törlés",
      });
    }
  };

  const handleDeleteProduct = async (product_id: number) => {
    const data = {
      action: "delete",
      product_id: product_id,
    };
    const response = await DeleteProduct(data);
    if (response.status === 200) {
      setAvaiableProducts(
        avaiableProducts.filter((item) => item.id !== product_id)
      );
      toast({
        title: "Sikeresen törölve",
        description: "Sikeresen törölte a terméket",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Sikertelen törlés",
      });
    }
  };

  const handleModifyProduct = async () => {
    const data = {
      action: "edit",
      product_id: modifyProduct.id,
      name: modifyProduct.name,
      description: modifyProduct.description,
      price: modifyProduct.price,
      quantity: modifyProduct.quantity,
      showed: modifyProduct.showed,
      categories: JSON.stringify(modifyProduct.categories),
    };

    const response = await ModifyProduct(data);
    if (response.status === 200) {
      setAvaiableProducts([
        ...avaiableProducts.map((item) => {
          if (item.id !== modifyProduct.id) {
            return { ...item };
          } else {
            return { ...modifyProduct };
          }
        }),
      ]);
      toast({
        title: "Sikeresen módosítva",
        description: "Sikeresen módosította a terméket",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Sikertelen módosítás",
      });
    }
  };

  const handleShipping = async (id: number) => {
    const data = {
      order_id: id,
    };

    const response = await DoneShipping(data);
    if (response.status === 200) {
      const newShippings = shippings.filter((ship: any) => ship.id !== id);
      setShippings(newShippings);
      toast({
        title: "Sikeres",
        description: "Sikeresen teljesítetted a rendelést",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Ismeretlen hiba",
      });
    }
  };

  const handleAdminChange = async () => {
    const data = {
      profiles: modifyAdmins,
    };
    const response = await setAdminPermissions(data);
    if (response.status === 200) {
      setAdmins(modifyAdmins);
      toast({
        title: "Sikeres",
        description: "Sikeresen módosítottad a jogosultságokat",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Ismeretlen hiba",
      });
    }
  };

  return (
    <div className="max-h-screen">
      <Navbar />
      <div className="grid grid-flow-row lg:grid-flow-col lg:grid-cols-2 h-[calc(100vh-3.5rem)]">
        <div className="h-full">
          <Tabs
            defaultValue="statistics"
            className="m-2 h-[calc(100vh-3.5rem-2.5rem-1rem)]"
          >
            <TabsList className="grid w-full grid-cols-4 h-10">
              <TabsTrigger value="statistics">Statisztikák</TabsTrigger>
              <TabsTrigger value="orders">Rendelések</TabsTrigger>
              <TabsTrigger value="permissions">Jogosultságok</TabsTrigger>
              <TabsTrigger value="quantity">Elfogyó termékek</TabsTrigger>
            </TabsList>
            <TabsContent value="statistics" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Statisztikák</CardTitle>
                  <CardDescription>Webshop statisztikái</CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100vh-3.5rem-2.5rem-1rem-7rem)]">
                  <Tabs defaultValue="money">
                    <TabsContent value="money" className="h-full">
                      <Line
                        height={window.innerHeight * 0.7}
                        options={{
                          maintainAspectRatio: false,
                          responsive: true,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            title: {
                              display: false,
                            },
                          },
                        }}
                        data={{
                          labels: statistics?.money?.labels,
                          datasets: [
                            {
                              data: statistics?.money?.values,
                              borderColor: "rgb(255, 99, 132)",
                              backgroundColor: "rgba(255, 99, 132, 0.5)",
                            },
                          ],
                        }}
                      />
                    </TabsContent>
                    <TabsContent value="cat" className="h-full">
                      <Pie
                        height={window.innerHeight * 0.7}
                        options={{
                          maintainAspectRatio: false,
                          responsive: true,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            title: {
                              display: false,
                            },
                          },
                        }}
                        data={{
                          labels: statistics?.categories?.labels,
                          datasets: [
                            {
                              data: statistics?.categories?.values,
                              backgroundColor: [
                                "rgba(255, 99, 132, 0.2)",
                                "rgba(54, 162, 235, 0.2)",
                                "rgba(255, 206, 86, 0.2)",
                                "rgba(75, 192, 192, 0.2)",
                                "rgba(153, 102, 255, 0.2)",
                                "rgba(255, 159, 64, 0.2)",
                              ],
                              borderColor: [
                                "rgba(255, 99, 132, 1)",
                                "rgba(54, 162, 235, 1)",
                                "rgba(255, 206, 86, 1)",
                                "rgba(75, 192, 192, 1)",
                                "rgba(153, 102, 255, 1)",
                                "rgba(255, 159, 64, 1)",
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                      />
                    </TabsContent>
                    <TabsContent value="top" className="h-full">
                      <Bar
                        height={window.innerHeight * 0.7}
                        options={{
                          maintainAspectRatio: false,
                          responsive: true,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            title: {
                              display: false,
                            },
                          },
                        }}
                        data={{
                          labels: statistics?.top?.labels.map(
                            (item: any) => `${item.slice(0, 20)}...`
                          ),
                          datasets: [
                            {
                              data: statistics?.top?.values,
                              backgroundColor: "rgba(255, 99, 132, 0.5)",
                            },
                          ],
                        }}
                      />
                    </TabsContent>
                    <CardFooter className="p-0 m-0 mx-2 pt-1">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="money">Bevétel</TabsTrigger>
                        <TabsTrigger value="cat">Top Kategóriák</TabsTrigger>
                        <TabsTrigger value="top">Top 5 termék</TabsTrigger>
                      </TabsList>
                    </CardFooter>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="h-full">
              <Card className="h-full">
                <CardHeader className="h-fit">
                  <CardTitle>Rendelések</CardTitle>
                  <CardDescription>
                    Felhasználók rendeléseinek kezelése
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 h-[calc(100vh-3.5rem-2.5rem-1rem-7rem)]">
                  <ScrollArea className="h-full rounded-md border">
                    {shippings.map((ship: any) => (
                      <div key={ship?.id}>
                        <div className="m-4 flex justify-between items-center">
                          <div className="text-md">
                            {ship?.profile?.first_name}{" "}
                            {ship?.profile?.last_name}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-md">
                              {(
                                ship.products.reduce(
                                  (
                                    total: number,
                                    product: { price: number; quantity: number }
                                  ) => total + product.price * product.quantity,
                                  0
                                ) *
                                (1 - ship.discount / 100)
                              )
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
                              HUF
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button>Termékek</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-5xl">
                                <ScrollArea className="max-w-screen whitespace-nowrap rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-left">
                                          Név
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Cím
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Email
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Telefonszám
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell className="text-left">
                                          {ship?.profile?.first_name}{" "}
                                          {ship?.profile?.last_name}
                                        </TableCell>
                                        <TableCell className="text-center">
                                          {ship?.address?.country}{" "}
                                          {ship?.address?.city}{" "}
                                          {ship?.address?.street}{" "}
                                          {ship?.address?.house_number}{" "}
                                          {ship?.address?.flat_number}
                                        </TableCell>
                                        <TableCell className="text-center">
                                          {ship?.profile?.email}
                                        </TableCell>
                                        <TableCell className="text-center">
                                          {ship?.profile?.phone_number}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                  <Separator className="my-2" />
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-left">
                                          Termék képe
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Termék neve
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Termék ára / db
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Termék ára
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Mennyiség
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {ship?.products?.map((product: any) => (
                                        <TableRow key={product.id}>
                                          <TableCell className="text-center">
                                            <img
                                              className="w-24 h-24"
                                              src={PhotoURL + product.images[0]}
                                            />
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {product.name}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {product.price
                                              .toString()
                                              .replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                "."
                                              )}{" "}
                                            HUF
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {(product.quantity * product.price)
                                              .toString()
                                              .replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                "."
                                              )}{" "}
                                            HUF
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {product.quantity}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                    <TableFooter>
                                      <TableRow>
                                        <TableCell
                                          colSpan={1}
                                          className="text-right"
                                        >
                                          Kedvezmény:
                                        </TableCell>
                                        <TableCell className="text-left">
                                          {ship.discount} %
                                        </TableCell>
                                        <TableCell className="text-right">
                                          Összesen:
                                        </TableCell>
                                        <TableCell className="text-center">
                                          {(
                                            ship.products.reduce(
                                              (
                                                total: number,
                                                product: {
                                                  price: number;
                                                  quantity: number;
                                                }
                                              ) =>
                                                total +
                                                product.price *
                                                  product.quantity,
                                              0
                                            ) *
                                            (1 - ship.discount / 100)
                                          )
                                            .toString()
                                            .replace(
                                              /\B(?=(\d{3})+(?!\d))/g,
                                              "."
                                            )}{" "}
                                          HUF
                                        </TableCell>
                                        <TableCell>
                                          <DialogClose asChild>
                                            <Button
                                              className="w-full"
                                              onClick={() =>
                                                handleShipping(ship?.id)
                                              }
                                            >
                                              Véglegesítés
                                            </Button>
                                          </DialogClose>
                                        </TableCell>
                                      </TableRow>
                                    </TableFooter>
                                  </Table>
                                  <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="permissions" className="h-full">
              <Card className="h-full">
                <CardHeader className="h-fit">
                  <CardTitle>Jogosultságok</CardTitle>
                  <CardDescription>
                    Módosítsa a felhasználók admin jogosultságát
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 h-[calc(100vh-3.5rem-2.5rem-1rem-10.5rem)]">
                  <ScrollArea className="h-full rounded-md border">
                    {admins.map((admin: any) => (
                      <div key={admins.email}>
                        <div className="m-4 flex justify-between items-center">
                          <div className="text-md">{`${admin.first_name} ${admin.last_name} (${admin.email})`}</div>
                          <Switch
                            defaultChecked={admin.is_admin}
                            onCheckedChange={(e) => {
                              setModifyAdmins(
                                modifyAdmins.map((item: any) => {
                                  if (item.email === admin.email) {
                                    return { ...item, is_admin: e };
                                  } else {
                                    return { ...item };
                                  }
                                })
                              );
                            }}
                          />
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={areArraysEqual(admins, modifyAdmins)}
                    onClick={() => handleAdminChange()}
                  >
                    Mentés
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="quantity" className="h-full">
              <Card className="h-full">
                <CardHeader className="h-fit">
                  <CardTitle>Elfogyó termékek</CardTitle>
                  <CardDescription>
                    Legkevesebb készeten lévő 10 termék
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 h-[calc(100vh-3.5rem-2.5rem-1rem-7rem)]">
                  <ScrollArea className="h-full rounded-md border">
                    {statistics?.quantity?.map((product: any) => (
                      <div key={product[0]}>
                        <div className="m-4 flex justify-between items-center">
                          <div className="text-md">{product[0]}</div>
                          <div className="text-md">{product[1]}</div>
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="h-full">
          <Tabs
            defaultValue="products"
            className="m-2 h-[calc(100vh-3.5rem-2.5rem-1rem)]"
          >
            <TabsList className="grid w-full grid-cols-3 h-10">
              <TabsTrigger value="products">Termékek</TabsTrigger>
              <TabsTrigger value="categories">Kategóriák</TabsTrigger>
              <TabsTrigger value="coupons">Kuponok</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Termékek kezelése</CardTitle>
                  <CardDescription>
                    Hozzon létre, módosítsa vagy törölje a termékeket
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 h-[calc(100vh-3.5rem-2.5rem-1rem-10.5rem)]">
                  <ScrollArea className="h-full rounded-md border">
                    {avaiableProducts.map((product) => (
                      <div key={product.id}>
                        <div className="m-4 flex justify-between items-center">
                          <div className="flex items-center gap-x-4">
                            <img
                              className="w-10 h-10"
                              src={PhotoURL + product.images[0]}
                            />
                            <div className="text-md">
                              {product.name}
                              {!product.showed ? " (elrejtve)" : ""}
                            </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => setModifyProduct(product)}>
                                Módosítás
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[650px]">
                              <DialogHeader>
                                <DialogTitle>Termék módosítása</DialogTitle>
                                <DialogDescription>
                                  Módosítsa a már meglévő terméket
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex flex-col">
                                <Label htmlFor="name" className="mb-2">
                                  Termék neve
                                </Label>
                                <Input
                                  type="text"
                                  id="name"
                                  placeholder="Termék neve"
                                  value={modifyProduct.name}
                                  onChange={(e) =>
                                    setModifyProduct({
                                      ...modifyProduct,
                                      name: e.target.value,
                                    })
                                  }
                                />
                                <Label htmlFor="description" className="my-2">
                                  Termék leírása
                                </Label>
                                <Textarea
                                  placeholder="Termék leírása"
                                  id="description"
                                  value={modifyProduct.description}
                                  onChange={(e) =>
                                    setModifyProduct({
                                      ...modifyProduct,
                                      description: e.target.value,
                                    })
                                  }
                                />
                                <Label htmlFor="price" className="my-2">
                                  Termék ára
                                </Label>
                                <Input
                                  type="number"
                                  id="price"
                                  placeholder="Termék ára"
                                  value={modifyProduct.price}
                                  onChange={(e) =>
                                    setModifyProduct({
                                      ...modifyProduct,
                                      price: e.target.value,
                                    })
                                  }
                                />
                                <Label htmlFor="quantity" className="my-2">
                                  Termék darabszáma
                                </Label>
                                <Input
                                  type="number"
                                  id="quantity"
                                  placeholder="Termék darabszáma"
                                  value={modifyProduct.quantity}
                                  onChange={(e) =>
                                    setModifyProduct({
                                      ...modifyProduct,
                                      quantity: e.target.value,
                                    })
                                  }
                                />
                                <Label htmlFor="category" className="my-2">
                                  Termék kategóriája
                                </Label>
                                <ScrollArea
                                  id="category"
                                  className="max-h-[calc(100vh-40rem)] rounded-md border"
                                >
                                  {avaiableCategories.map((category) => (
                                    <div
                                      key={category}
                                      className="flex items-center space-x-2 m-4"
                                    >
                                      <Checkbox
                                        id="category"
                                        checked={modifyProduct.categories.includes(
                                          category
                                        )}
                                        onCheckedChange={(value) => {
                                          if (value) {
                                            setModifyProduct({
                                              ...modifyProduct,
                                              categories: [
                                                ...modifyProduct.categories,
                                                category,
                                              ],
                                            });
                                          } else {
                                            setModifyProduct({
                                              ...modifyProduct,
                                              categories:
                                                modifyProduct.categories.filter(
                                                  (item) => item !== category
                                                ),
                                            });
                                          }
                                        }}
                                      />
                                      <label
                                        htmlFor="category"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {category}
                                      </label>
                                    </div>
                                  ))}
                                </ScrollArea>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Checkbox
                                    id="showed"
                                    checked={modifyProduct.showed}
                                    onCheckedChange={(e) => {
                                      setModifyProduct({
                                        ...modifyProduct,
                                        showed: e,
                                      });
                                    }}
                                  />
                                  <Label htmlFor="showed">
                                    Termék megjelenítése
                                  </Label>
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <div className="flex flex-1 justify-between">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() =>
                                        handleDeleteProduct(product.id)
                                      }
                                    >
                                      Törlés
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => handleModifyProduct()}
                                    >
                                      Módosítás
                                    </Button>
                                  </div>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">Új termék létrehozása</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[650px]">
                      <DialogHeader>
                        <DialogTitle>Termék létrehozása</DialogTitle>
                        <DialogDescription>
                          Hozzon létre új terméket
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col">
                        <Label htmlFor="name" className="mb-2">
                          Termék neve
                        </Label>
                        <Input
                          type="text"
                          id="name"
                          placeholder="Termék neve"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <Label htmlFor="description" className="my-2">
                          Termék leírása
                        </Label>
                        <Textarea
                          placeholder="Termék leírása"
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                        <Label htmlFor="price" className="my-2">
                          Termék ára
                        </Label>
                        <Input
                          type="number"
                          id="price"
                          placeholder="Termék ára"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                        <Label htmlFor="quantity" className="my-2">
                          Termék darabszáma
                        </Label>
                        <Input
                          type="number"
                          id="quantity"
                          placeholder="Termék darabszáma"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                        <div className="flex items-center space-x-2 my-2">
                          <Checkbox
                            id="showed"
                            checked={showed}
                            onCheckedChange={(e) => setShowed(e)}
                          />
                          <Label htmlFor="showed">Termék megjelenítése</Label>
                        </div>
                        <Label htmlFor="category">Termék kategóriája</Label>
                        <ScrollArea
                          id="category"
                          className="max-h-[calc(100vh-40rem)] rounded-md border"
                        >
                          {avaiableCategories.map((category) => (
                            <div
                              key={category}
                              className="flex items-center space-x-2 m-4"
                            >
                              <Checkbox
                                id="category"
                                checked={categories.includes(category)}
                                onCheckedChange={(value) => {
                                  if (value) {
                                    setCategories([...categories, category]);
                                  } else {
                                    setCategories(
                                      categories.filter(
                                        (item) => item !== category
                                      )
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor="category"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {category}
                              </label>
                            </div>
                          ))}
                        </ScrollArea>
                        <Label htmlFor="picture" className="my-2">
                          Termék képe
                        </Label>
                        <Input
                          id="picture"
                          type="file"
                          onChange={(e) => {
                            if (e.target.files) {
                              setPicture(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            type="button"
                            onClick={() => handleAddNewProduct()}
                          >
                            Létrehozás
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="categories" className="h-full">
              <Card className="h-full">
                <CardHeader className="h-fit">
                  <CardTitle>Kategóriák kezelése</CardTitle>
                  <CardDescription>
                    Hozzon létre új kategóriákat vagy törölje őket
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 h-[calc(100vh-3.5rem-2.5rem-1rem-10.5rem)]">
                  <ScrollArea className="h-full rounded-md border">
                    {avaiableCategories.map((category) => (
                      <div key={category}>
                        <div className="m-4 flex justify-between items-center">
                          <div className="text-md">{category}</div>
                          <Button
                            onClick={() => handleDeleteCategory(category)}
                          >
                            Törlés
                          </Button>
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        Új kategória létrehozása
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Kategória létrehozása</DialogTitle>
                        <DialogDescription>
                          Hozzon létre új kategóriát
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="new_category">Kategória neve</Label>
                        <Input
                          id="new_category"
                          type="text"
                          placeholder="Kategória neve"
                          onChange={(e) => setNewCategory(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            type="button"
                            onClick={() => handleAddNewCategory()}
                          >
                            Létrehozás
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="coupons" className="h-full">
              <Card className="h-full">
                <CardHeader className="h-fit">
                  <CardTitle>Kuponok kezelése</CardTitle>
                  <CardDescription>
                    Hozzon létre, módosítsa vagy törölje a kuponokat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 h-[calc(100vh-3.5rem-2.5rem-1rem-10.5rem)]">
                  <ScrollArea className="h-full rounded-md border">
                    {coupons.map((coupon) => (
                      <div key={coupon.id}>
                        <div className="m-4 flex justify-between items-center">
                          <div className="text-md">
                            {coupon.code} ({coupon.discount} %)
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => setModifyCoupon(coupon)}>
                                Módosítás
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Kupon módosítása</DialogTitle>
                                <DialogDescription>
                                  Módosítsa a már meglévő kupont
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor="coupon_code">Kupon kód</Label>
                                  <Input
                                    id="coupon_code"
                                    type="text"
                                    placeholder="Kupon kód"
                                    value={modifyCoupon.code}
                                    onChange={(e) =>
                                      setModifyCoupon({
                                        ...modifyCoupon,
                                        code: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor="coupon_discount">
                                    Kedvezmény (%)
                                  </Label>
                                  <Input
                                    id="coupon_discount"
                                    type="number"
                                    min={0}
                                    max={100}
                                    placeholder="Kedvezmény (%)"
                                    value={modifyCoupon.discount}
                                    onChange={(e) =>
                                      setModifyCoupon({
                                        ...modifyCoupon,
                                        discount: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <div className="flex flex-1 justify-between">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() =>
                                        handleDeleteCoupon(coupon.id)
                                      }
                                    >
                                      Törlés
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => handleModifyCoupon()}
                                    >
                                      Módosítás
                                    </Button>
                                  </div>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">Új kupon létrehozása</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Kupon létrehozása</DialogTitle>
                        <DialogDescription>
                          Hozzon létre új kupont
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="new_code">Kupon kód</Label>
                        <Input
                          id="new_code"
                          type="text"
                          placeholder="Kupon kód"
                          onChange={(e) =>
                            setNewCoupon({ ...newCoupon, code: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="new_discount">Kedvezmény (%)</Label>
                        <Input
                          id="new_discount"
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Kedvezmény (%)"
                          onChange={(e) =>
                            setNewCoupon({
                              ...newCoupon,
                              discount: e.target.value,
                            })
                          }
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            type="button"
                            onClick={() => handleAddNewCoupon()}
                          >
                            Létrehozás
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
