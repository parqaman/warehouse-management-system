import { collection, getDocs, query } from '@firebase/firestore';
import { and, doc, getDoc, or, updateDoc, where } from 'firebase/firestore';
import { FormEvent, useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoRemoveCircleOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InputField } from 'renderer/components/InputField';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableModal } from 'renderer/components/TableComponents/TableModal';
import { db } from 'renderer/firebase';
import { Customer } from 'renderer/interfaces/Customer';
import { SpecialPrice } from 'renderer/interfaces/SpecialPrice';
import { PageLayout } from 'renderer/layout/PageLayout';

const newCustomerInitialState = {
  name: '',
  address: '',
  phone_number: '',
  SpecialPrice: [],
} as Customer;

function EditCustomerPage() {
  const navigate = useNavigate();
  const param = useParams();
  const [newCustomer, setNewCustomer] = useState<Customer>(
    newCustomerInitialState
  );
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SpecialPrice[]>([]);
  const [products, setProducts] = useState<SpecialPrice[]>([]);

  const successNotify = () =>
    toast.success('Data Customer berhasil diubah', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  const failNotify = (e?: string) =>
    toast.error(e ?? 'Data Customer gagal diubah', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (param.id === undefined) return;
        const customerRef = doc(db, 'customer', param.id);
        const customerSnap = await getDoc(customerRef);
        const customerData = customerSnap.data() as Customer;
        customerData.id = customerSnap.id;
        setNewCustomer(customerData);

        setSelectedProducts(customerData.SpecialPrice);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // If one or more fields are empty except remarks, return early
    if (
      !newCustomer.name ||
      !newCustomer.address ||
      !newCustomer.phone_number
    ) {
      setErrorMessage('Tolong isi semua kolom');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    // Check data type
    if (Number.isNaN(Number(newCustomer.phone_number))) {
      setErrorMessage('Nomor telepon harus berupa angka');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (newCustomer.SpecialPrice.some((sp) => sp.price === 0)) {
      setErrorMessage('Harga khusus tidak boleh 0');
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    // Update customer data
    setLoading(true);
    try {
      if (!param.id) return;
      const customerRef = doc(db, 'customer', param.id);
      await updateDoc(customerRef, {
        name: newCustomer.name,
        address: newCustomer.address,
        phone_number: newCustomer.phone_number,
        SpecialPrice: selectedProducts,
      });
      setLoading(false);
      successNotify();
    } catch (error) {
      setLoading(false);
      const errorMessage = error as string;
      failNotify(errorMessage);
    }
  }

  const handleSearch = async (search: string) => {
    const productsQuery = query(
      collection(db, 'product'),
      or(
        // Query as-is:
        and(
          where('brand', '>=', search),
          where('brand', '<=', search + '\uf8ff')
        ),
        // Capitalize first letter:
        and(
          where(
            'brand',
            '>=',
            search.charAt(0).toUpperCase() + search.slice(1)
          ),
          where(
            'brand',
            '<=',
            search.charAt(0).toUpperCase() + search.slice(1) + '\uf8ff'
          )
        ),
        // Lowercase:
        and(
          where('brand', '>=', search.toLowerCase()),
          where('brand', '<=', search.toLowerCase() + '\uf8ff')
        )
      )
    );
    setLoading(true);
    const querySnapshot = await getDocs(productsQuery);

    const productData: SpecialPrice[] = [];
    querySnapshot.forEach((theProduct) => {
      const data = theProduct.data() as SpecialPrice;
      data.product_id = theProduct.id;
      data.price = theProduct.get('sell_price') as number;
      productData.push(data);
    });

    setProducts(productData);
    setLoading(false);
  };

  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Edit Customer
      </h1>
      <form
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative ${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
        <InputField
          loading={loading}
          label="Nama"
          labelFor="name"
          value={newCustomer.name}
          placeholder="i.e. John Doe"
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, name: e.target.value })
          }
        />
        <InputField
          loading={loading}
          label="Alamat"
          labelFor="address"
          value={newCustomer.address}
          placeholder="i.e. Jl.Soekarno-Hatta No. 123"
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, address: e.target.value })
          }
        />
        <InputField
          loading={loading}
          label="Nomor Telepon"
          labelFor="phone_number"
          value={newCustomer.phone_number}
          placeholder="Phone number or landline number"
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, phone_number: e.target.value })
          }
        />

        <hr className="my-4" />
        <h2 className="text-2xl font-bold">Harga Khusus</h2>
        <ul className="my-3 space-y-3 font-regular">
          {selectedProducts.map((product, index) => (
            <li key={index}>
              <div className="flex flex-row gap-2 justify-between items-center">
                <div className="w-full flex justify-between items-center">
                  <div className="w-4/5">
                    <label htmlFor="price" className="text-md">
                      {product.brand +
                        ' ' +
                        product.motor_type +
                        ' ' +
                        product.part +
                        ' ' +
                        product.available_color}
                    </label>
                  </div>
                  <div className="w-1/5">
                    <input
                      disabled={loading}
                      id={'price'}
                      name={'price'}
                      type={'number'}
                      className={`placeholder:text-xs placeholder:font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full
                      `}
                      value={
                        newCustomer.SpecialPrice.find(
                          (sp) => sp.product_id === product.product_id
                        )?.price ?? product.sell_price
                      }
                      onChange={(e) => {
                        if (
                          !/^[0-9]*(\.[0-9]*)?$/.test(e.target.value) &&
                          e.target.value !== ''
                        )
                          return;
                        const newSpecialPriceProducts = [
                          ...newCustomer.SpecialPrice,
                        ];
                        const index = newSpecialPriceProducts.findIndex(
                          (sp) => sp.product_id === product.product_id
                        );
                        newSpecialPriceProducts[index].price = Number(
                          e.target.value
                        );
                        setNewCustomer(() => {
                          return {
                            ...newCustomer,
                            SpecialPrice: newSpecialPriceProducts,
                          };
                        });
                      }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="py-2 px-5 text-sm font-medium text-red-500 focus:outline-none bg-white rounded-lg border:none hover:text-red-900 focus:z-10 focus:ring-4 focus:ring-gray-200"
                  onClick={() => {
                    setSelectedProducts(
                      selectedProducts.filter((p) => p !== product)
                    );
                    if (product.id)
                      newCustomer.SpecialPrice =
                        newCustomer.SpecialPrice.filter(
                          (sp) => sp.product_id !== product.id
                        );
                  }}
                >
                  <IoRemoveCircleOutline size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {product.warehouse_position}
              </p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="py-2 px-5 text-sm font-medium text-red-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
          onClick={() => setModalOpen(true)}
        >
          + Pilih Produk
        </button>

        <div className="flex flex-row-reverse gap-2 justify-start">
          <button
            disabled={loading}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 focus:outline-none"
            onClick={(e) => {
              handleSubmit(e).catch((error) => console.log(error));
            }}
          >
            Simpan
          </button>
          <button
            disabled={loading}
            type="button"
            className="py-2 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
            onClick={() => navigate(-1)}
          >
            Batal
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm ">{errorMessage}</p>
        )}
      </form>
      <TableModal
        placeholder="Cari berdasarkan merek produk"
        modalOpen={modalOpen}
        handleSearch={handleSearch}
        setModalOpen={setModalOpen}
        title={'Pilih Produk'}
        headerList={
          products.length > 0
            ? ['', 'Nama Product', 'Harga Jual', 'Posisi Gudang']
            : []
        }
      >
        {products.length > 0 ? (
          products.map((product, index) => (
            <tr
              key={index}
              className="border-b hover:shadow-md cursor-pointer"
              onClick={() => {
                if (
                  !selectedProducts.some(
                    (sp) => sp.product_id === product.product_id
                  )
                ) {
                  setSelectedProducts([...selectedProducts, product]);
                  if (product.id)
                    newCustomer.SpecialPrice = [
                      ...newCustomer.SpecialPrice,
                      product,
                    ];
                } else {
                  setSelectedProducts(
                    selectedProducts.filter((p) => p !== product)
                  );
                  if (product.id)
                    newCustomer.SpecialPrice = newCustomer.SpecialPrice.filter(
                      (sp) => sp.product_id !== product.id
                    );
                }
              }}
            >
              <SingleTableItem>
                <input
                  type="checkbox"
                  checked={selectedProducts.some(
                    (sp) => sp.product_id === product.product_id
                  )}
                />
              </SingleTableItem>
              <SingleTableItem key={index}>
                {product.brand +
                  ' ' +
                  product.motor_type +
                  ' ' +
                  product.part +
                  ' ' +
                  product.available_color}
              </SingleTableItem>
              <SingleTableItem>{product.sell_price}</SingleTableItem>
              <SingleTableItem>{product.warehouse_position}</SingleTableItem>
            </tr>
          ))
        ) : (
          <tr className="border-b">
            <SingleTableItem>
              <p className="flex justify-center">No products found</p>
            </SingleTableItem>
          </tr>
        )}
      </TableModal>
    </PageLayout>
  );
}

export default EditCustomerPage;
