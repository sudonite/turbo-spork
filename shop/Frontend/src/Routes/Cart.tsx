import { useEffect, useState } from "react";
import { PhotoURL } from "@/Consts";
import { getCart, DeleteFromCart, FinishCart, ValidateCoupon } from "@/API";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import Navbar from "@/components/NavBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Cart = () => {
  const [orders, setOrders] = useState<any>([]);
  const [coupon, setCoupon] = useState<any>({});
  const [finalPrice, setFinalPrice] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponActivated, setCouponActivated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getData = async () => {
      const response = await getCart();
      if (response.status === 200) {
        setOrders(response.data);
        setFinalPrice(
          response.data.reduce((total: number, product: any) => {
            const cost = product.price * product.quantity;
            return total + cost;
          }, 0)
        );
      } else {
        toast({
          title: "Hiba",
          description: "Ismeretlen hiba",
        });
      }
    };

    getData();
  }, []);

  const handleDelete = async (id: number) => {
    const data = {
      action: "delete",
      product_id: id,
    };
    const response = await DeleteFromCart(data);
    if (response.status === 200) {
      setOrders(orders.filter((product: any) => product.id !== id));
      toast({
        title: "Sikeres törlés",
        description: "A termék sikeresen törölve a kosárból",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Ismeretlen hiba",
      });
    }
  };

  const handleOrder = async () => {
    let data = {
      action: "finish",
      coupon_code: couponActivated ? coupon.code : "",
    };
    const response = await FinishCart(data);
    if (response.status === 200) {
      setOrders([]);
      toast({
        title: "Sikeres rendelés",
        description: "A rendelését sikeresen rögzítettük",
      });
    } else if (response.status === 400) {
      toast({
        title: "Hiányzó adatok",
        description: "Állítsa be hiányzó adatait a beállításokban",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Ismeretlen hiba",
      });
    }
  };

  const handleActivateCoupon = async () => {
    const data = {
      action: "validate",
      code: couponCode,
    };
    const response = await ValidateCoupon(data);
    if (response.status === 200) {
      setCoupon(response.data);
      setCouponActivated(true);
      setFinalPrice(finalPrice * (1 - response.data.discount / 100));
      toast({
        title: "Kupon aktiválva",
        description: "A kupon sikeresen aktiválva",
      });
    } else if (response.status === 204) {
      toast({
        title: "Érvénytelen kupon",
        description: "A kupon nem érvényes",
      });
    } else {
      toast({
        title: "Hiba",
        description: "Ismeretlen hiba",
      });
    }
  };

  return (
    <>
      <Navbar />
      <ScrollArea className="max-w-screen whitespace-nowrap rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Termék képe</TableHead>
              <TableHead className="text-center">Termék neve</TableHead>
              <TableHead className="text-center">Termék ára / db</TableHead>
              <TableHead className="text-center">Termék ára</TableHead>
              <TableHead className="text-center">Mennyiség</TableHead>
              <TableHead className="text-center">Művelet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell className="text-center">
                  <img
                    className="w-24 h-24"
                    src={PhotoURL + product.images[0]}
                  />
                </TableCell>
                <TableCell className="text-center">{product.name}</TableCell>
                <TableCell className="text-center">
                  {product.price
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
                  HUF
                </TableCell>
                <TableCell className="text-center">
                  {(product.quantity * product.price)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
                  HUF
                </TableCell>
                <TableCell className="text-center">
                  {product.quantity}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    className="w-full"
                    onClick={() => handleDelete(product.id)}
                  >
                    Törlés
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>
                <div className="flex justify-end">
                  <Input
                    className="w-1/4"
                    placeholder="Kupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  className="w-full"
                  disabled={couponActivated}
                  onClick={() => handleActivateCoupon()}
                >
                  Ellenőrzés
                </Button>
              </TableCell>
              <TableCell className="text-right">Összesen:</TableCell>
              <TableCell className="text-center">
                {finalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
                HUF
              </TableCell>
              <TableCell>
                <Button
                  className="w-full"
                  disabled={orders.length === 0}
                  onClick={() => handleOrder()}
                >
                  Megrendelés
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
};

export default Cart;
