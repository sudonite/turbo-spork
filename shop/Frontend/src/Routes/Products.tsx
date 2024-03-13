import { useState, useEffect } from "react";

import Navbar from "@/components/NavBar";
import ProductCard from "@/components/ProductCard";

import { getCategories, getProducts } from "../API";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";

import { Filter } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState<any>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [favoritesEnabled, setFavoritesEnabled] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>("");
  const [filterOn, setFilterOn] = useState<boolean>(true);

  const { toast } = useToast();

  useEffect(() => {
    const getData = async () => {
      const products = await getProducts();
      const categories = await getCategories();

      if (products?.status === 200 && categories?.status === 200) {
        console.log(products?.data);
        setProducts(products?.data);
        setCategories([...categories?.data]);
      } else {
        toast({
          title: "Hiba",
          description: "Ismeretlen hiba",
        });
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const handleResize = () =>
      setFilterOn(window.innerWidth > 1024 ? true : false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="max-h-screen">
      <Navbar />
      <div className="grid grid-flow-row lg:grid-flow-col lg:grid-cols-6 gap-4 h-[calc(100vh-3.5rem)]">
        <div className="col-span-6 lg:col-span-1 overflow-y-hidden flex flex-col mx-2">
          <div className="flex justify-end mr-3">
            <Toggle
              variant="outline"
              className="lg:hidden"
              pressed={filterOn}
              onPressedChange={() => setFilterOn(!filterOn)}
            >
              <Filter className="mr-2 h-4 w-4" /> Szűrés
            </Toggle>
          </div>
          {filterOn && (
            <>
              <Label className="text-xl font-bold" htmlFor="category">
                Termék kategóriák
              </Label>
              <ScrollArea
                id="category"
                className="h-full w-full mt-2 mb-1 rounded-md border"
              >
                <div className="flex items-center space-x-2 m-4">
                  <Checkbox
                    id="category"
                    checked={favoritesEnabled}
                    onCheckedChange={(value) => {
                      if (value) {
                        setFavoritesEnabled(true);
                      } else {
                        setFavoritesEnabled(false);
                      }
                    }}
                  />
                  <label
                    htmlFor="category"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Kedvencek
                  </label>
                </div>
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center space-x-2 m-4"
                  >
                    <Checkbox
                      id="category"
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(value) => {
                        if (value) {
                          setSelectedCategories([
                            ...selectedCategories,
                            category,
                          ]);
                        } else {
                          setSelectedCategories([
                            ...selectedCategories.filter((c) => c !== category),
                          ]);
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
            </>
          )}
        </div>
        <div className="col-span-5 overflow-y-hidden flex flex-col px-1 ml-4">
          {filterOn && (
            <>
              <Label className="text-xl font-bold" htmlFor="search">
                Termék keresése
              </Label>
              <Input
                type="text"
                className="w-full lg:w-1/4 mt-2"
                id="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Termék keresése"
              />
            </>
          )}
          <ScrollArea
            id="category"
            className="h-full mt-2 mb-1 rounded-md border"
          >
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-4">
              {products
                .filter((product: any) => product.showed)
                .filter((product: any) =>
                  selectedCategories.every((category) =>
                    product.categories.includes(category)
                  )
                )
                .filter((product: any) =>
                  favoritesEnabled ? product.favorite : true
                )
                .filter((product: any) =>
                  product.name
                    .toLowerCase()
                    .includes(productSearch.toLowerCase())
                )
                .map((product: any) => (
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    images={product.images}
                    favorite={product.favorite}
                    products={products}
                    setProducts={setProducts}
                  />
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Products;
