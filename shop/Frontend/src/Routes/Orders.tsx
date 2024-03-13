import { useState, useEffect } from "react";

import { PhotoURL } from "@/Consts";

import { getOrders } from "@/API";

import { useToast } from "@/components/ui/use-toast";

import Navbar from "@/components/NavBar";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const Orders = () => {
  const [orders, setOrders] = useState<any>([]);
  const { toast } = useToast();

  useEffect(() => {
    const getData = async () => {
      const response = await getOrders();
      if (response.status === 200) {
        setOrders(response.data);
      } else {
        toast({
          title: "Hiba",
          description: "Ismeretlen hiba",
        });
      }
    };

    getData();
  }, []);

  return (
    <>
      <Navbar />
      <ScrollArea className="max-w-screen whitespace-nowrap rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Megrendelő neve</TableHead>
              <TableHead className="text-center">Megrendelő címe</TableHead>
              <TableHead className="text-center">
                Megrendelő email címe
              </TableHead>
              <TableHead className="text-center">Állapot</TableHead>
              <TableHead className="text-center">Termékek</TableHead>
              <TableHead className="text-center">Termékek ára</TableHead>
              <TableHead className="text-center">Művelet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="text-left">
                  {order?.profile?.first_name} {order?.profile?.last_name}
                </TableCell>
                <TableCell className="text-center">
                  {order?.address?.country} {order?.address?.city}{" "}
                  {order?.address?.street} {order?.address?.house_number}{" "}
                  {order?.address?.flat_number}
                </TableCell>
                <TableCell className="text-center">
                  {order?.profile?.email}
                </TableCell>
                <TableCell className="text-center">
                  {order?.shipped ? "Kiszállítva" : "Feldolgozás alatt"}
                </TableCell>
                <TableCell className="text-center">
                  {order.products.reduce(
                    (acc: number, curr: { quantity: number }) =>
                      acc + curr.quantity,
                    0
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {(
                    order.products.reduce(
                      (
                        total: number,
                        product: { price: number; quantity: number }
                      ) => total + product.price * product.quantity,
                      0
                    ) *
                    (1 - order.discount / 100)
                  )
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
                  HUF
                </TableCell>
                <TableCell className="text-center">
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
                            {order?.products?.map((product: any) => (
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
                              </TableRow>
                            ))}
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={2} className="text-right">
                                Kedvezmény:
                              </TableCell>
                              <TableCell className="text-center">
                                {order.discount} %
                              </TableCell>
                              <TableCell className="text-right">
                                Összesen:
                              </TableCell>
                              <TableCell className="text-center">
                                {(
                                  order.products.reduce(
                                    (
                                      total: number,
                                      product: {
                                        price: number;
                                        quantity: number;
                                      }
                                    ) =>
                                      total + product.price * product.quantity,
                                    0
                                  ) *
                                  (1 - order.discount / 100)
                                )
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
                                HUF
                              </TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
};
export default Orders;
