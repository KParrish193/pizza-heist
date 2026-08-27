"use client";

import Image from "next/image";
import Link from "next/link";
import Alert from "@/app/components/ux/alert/alert";
import SizeChart from "@/app/components/ordering/size-chart/SizeChart";
import Drawer from "@/app/components/ux/drawer/drawer";
import Cart from "@/app/components/ordering/cart/cart";
import { useCart, CartItem } from "@/app/components/ordering/cart/cartContext";
import { useTeam } from "@/app/components/ordering/team/teamContext";
import { useState, useEffect } from "react";
import styles from "./order.module.css";

interface FormData {
  size: string;
  cut: string;
  length: string;
  neckStyle: string;
  backStyle: string;
  color: string;
  jerseyName: string;
  jerseyNumber: string;
  pronouns: string;
};

interface FormErrors {
  size: string;
  cut: string;
  length: string;
  neckStyle: string;
  backStyle: string;
  color: string;
  jerseyName: string;
  jerseyNumber: string;
}

interface Discounts {
  reg: number;
  percent: number;
  salePrice: number;
  type: string;
}

export default function OrderForm() {
  // context for cart
  const { addItem } = useCart();
  const { team } = useTeam();

  const [sizes, setSizes] = useState<string[]>([]);
  const [cuts, setCuts] = useState<string[]>([]);
  const [lengths, setLengths] = useState<string[]>([]);
  const [neckStyles, setNeckStyles] = useState<string[]>([]);
  const [backStyles, setBackStyles] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number>(0);
  const [discounts, setDiscounts] = useState<Discounts>({reg: 0, percent: 0, salePrice: 0, type: ""});
  
  // ux state 
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // initiate form state
  const [formData, setFormData] = useState<FormData>({
    size: "",
    cut: "",
    length: "",
    neckStyle: "",
    backStyle: "",
    color: "",
    jerseyName: "",
    jerseyNumber: "",
    pronouns: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    size: "",
    cut: "",
    length: "",
    neckStyle: "",
    backStyle: "",
    color: "",
    jerseyName: "",
    jerseyNumber: ""
  });

  // form ux state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // set  dropdowns dynamically, import price from sheet
  useEffect(() => {
    async function loadOptions() {
      const res = await fetch("/api/jersey-options");
      const data: Record<string, string>[] = await res.json();

      const sheetPrice = data
        .map((row) => row["Price"])
        .filter(Boolean) as any;

        // TODO: update this to fix specific teams having discounts
      const sheetDiscountPercentage = data
        .map((row) => row["Discount Amount"])
        .filter(Boolean) as any;

      const sheetSalePrice = data
        .map((row) => row["Sale Price"])
        .filter(Boolean) as any;
      
      const discountType = data
        .map((row) => row["Discount Type"])
        .filter(Boolean) as string[];

      // find discount or sale price
      var calculatedPrice = 0

      // TODO: add fallback if both dicounts are applied
      if(sheetDiscountPercentage.length > 0){
        const percentageCalc = sheetPrice * (1 - sheetDiscountPercentage / 100);
        calculatedPrice = Math.round(percentageCalc * 100) / 100;
        setDiscounts({reg: sheetPrice, percent: sheetDiscountPercentage, salePrice: 0, type: discountType[0]});
      } else if(sheetSalePrice.length > 0){
        calculatedPrice = Math.round(sheetSalePrice * 100) / 100
        setDiscounts({reg: sheetPrice, percent: 0, salePrice: sheetSalePrice, type: discountType[0]});
      } else {
        calculatedPrice = sheetPrice;
        setDiscounts({reg: sheetPrice, percent: 0, salePrice: 0, type: ""})
      }
      setPrice(calculatedPrice);
      
      const filteredSizes = data
        .map((row) => row["Size"])
        .filter(Boolean) as string[];

      const filteredCuts = data
        .map((row) => row["Cut"])
        .filter(Boolean) as string[];

      const filteredLengths = data
        .map((row) => row["Length"])
        .filter(Boolean) as string[];
        
      const filteredNeck = data
        .map((row) => row["NeckStyle"])
        .filter(Boolean) as string[];
      
      const filteredBack = data
        .map((row) => row["BackStyle"])
        .filter(Boolean) as string[];
      
      const filteredColors = data
        .map((row) => row["Color"])
        .filter(Boolean) as string[];
      
      setSizes(filteredSizes);
      setCuts(filteredCuts);
      setLengths(filteredLengths);
      setNeckStyles(filteredNeck);
      setBackStyles(filteredBack);
      setColors(filteredColors);

    }
    loadOptions();
  }, []);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "size":
        return value ? "" : "Please select a size";
      case "cut":
        return value ? "" : "Please select a cut type";
      case "length":
        return value ? "" : "Please select a length";
      case "neck":
        return value ? "" : "Please select a neck option";
      case "back":
        return value ? "" : "Please select a back option";
      case "color":
        return value ? "" : "Please select a color";
      case "jerseyNumber":
        if (!value.trim()) return "Jersey number cannot be empty";
        if (value.length > 4) {
          return "Jersey number cannot contain more than 4 characters";
        }
        return "";
      case "jerseyName":
        if (value.length > 36) {
          return "Jersey name cannot contain more than 36 characters";
        }
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {
      size: validateField("size", formData.size),
      cut: validateField("cut", formData.cut),
      length: validateField("length", formData.length),
      neckStyle: validateField("neck", formData.neckStyle),
      backStyle: validateField("back", formData.backStyle),
      color: validateField("color", formData.color),
      jerseyName: validateField("jerseyName", formData.jerseyName),
      jerseyNumber: validateField("jerseyNumber", formData.jerseyNumber)
    };
    setFormErrors(newErrors);
    return Object.values(newErrors).every((err) => !err);
  };

  // set validation only after user interacts with input
  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Mark field as touched
    setTouched({ ...touched, [name]: true });

    // Validate the field now that user left it
    setFormErrors({ ...formErrors, [name]: validateField(name, value) });
  };

    const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    setFormData({ ...formData, [name]: formattedValue });
    setFormErrors({ ...formErrors, [name]: validateField(name, value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const isValid = validateForm();

    if (!isValid) {
      setError("Please fix the errors in the order form before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        teamId: team.id,
        teamName: team.name,
        teamSlug: team.slug,
        price,
        size: formData.size,
        cut: formData.cut,
        length: formData.length,
        neckStyle: formData.neckStyle,
        backStyle: formData.backStyle,
        color: formData.color,
        jerseyName: formData.jerseyName,
        jerseyNumber: formData.jerseyNumber,
        pronouns: formData.pronouns,
        quantity,
      };

      addItem(cartItem);
      setIsCartOpen(true);

      // Reset form
      setFormData({
        size: "",
        cut: "",
        length: "",
        neckStyle: "",
        backStyle: "",
        color: "",
        jerseyName: "",
        jerseyNumber: "",
        pronouns: "",
      });

      setQuantity(1);

      setFormErrors({
        size: "",
        cut: "",
        length: "",
        neckStyle: "",
        backStyle: "",
        color: "",
        jerseyName: "",
        jerseyNumber: "",
      });

    } catch (err) {
      setError(`Something went wrong. ${err}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  // Disable submit during submit
  const isSubmitDisabled = submitting

  // Functions and controls for form selections controlling display image
  const visualLengthMap: Record<string, Record<string, string>> = {
    "Full Back": {
      "Baby": "baby crop",
      "Regular": "regular",
      "Short": "short",
    },
    "High Neck": {
      "Crop": "crop",
      "Regular": "regular",
    },
    "Racer Back": {
      "Crop": "crop",
      "Long": "long",
      "Regular": "regular",
    },
    "Scoop Neck": {
      "Baby Crop": "baby crop",
      "Long": "long",
      "Regular": "regular",
      "Short": "short",
    },
  };

  const lengthPriority: Record<string, string[]> = {
    "Baby Crop": ["Baby Crop", "Crop", "Short", "Regular", "Long"],
    "Crop": ["Crop", "Baby Crop", "Short", "Regular", "Long"],
    "Regular": ["Regular", "Short", "Long", "Crop", "Baby Crop"],
    "Short": ["Short", "Crop", "Baby Crop", "Regular", "Long"],
    "Long": ["Long", "Regular", "Short", "Crop", "Baby Crop"],
  };

  const getClosestVisualLength = (
    back: string,
    requestedLength: string
  ) => {
    const availableLengths = visualLengthMap[back];
    if (!availableLengths) {
      return "regular";
    }
    const priorities = lengthPriority[requestedLength] || ["Regular"];
    const closestLength = priorities.find(
      (length) => availableLengths[length]
    );
    return availableLengths[closestLength || "Regular"] || "regular";
  };

  const getFrontImage = () => {
    const cut = formData.cut || "Fitted";
    const neck = formData.neckStyle || "High Neck";
    const length = formData.length || "Regular";
    const visualLength = getClosestVisualLength(neck, length);
    return `/drawings/${cut.toLowerCase()}/${neck.toLowerCase()}/${visualLength}.svg`;
  };

  const getBackImage = () => {
    const cut = formData.cut || "Fitted";
    const back = formData.backStyle || "Full Back";
    const length = formData.length || "Regular";
    const visualLength = getClosestVisualLength(back, length);
    return `/drawings/${cut.toLowerCase()}/${back.toLowerCase()}/${visualLength}.svg`;
  };

  const frontImage = getFrontImage();
  const backImage = getBackImage();
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>

        <div className={styles.headerWrapper}>
          <Link href="/" className={styles.logo}>
            <Image
              src={"/logos/horizontal-logo.svg"}
              alt={"pizza heist logo"}
              width={100}
              height={50}
              priority
            />
          </Link>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <Image
              src={"/icons/cart.svg"}
              alt={"pizza heist logo"}
              width={18}
              height={18}
              priority
            />
            {/* TODO: Functionality to add brackets/bubble and number of items in cart count */}
          </button>
        </div>

        <Drawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          headingChildren={      
              <h2>Cart</h2>
            }
        >
          <Cart
            onContinueShopping={() => setIsCartOpen(false)}
          />
        </Drawer>

        <div className={styles.formHeading}>
          <h1>Customize your jersey</h1>
          <button     
            type="button"
            onClick={() => setShowSizeChart(true)}
            className={styles.sizeChartbtn}>
            Size Chart
          </button>
        </div>
        
        <SizeChart
          isOpen={showSizeChart}
          onClose={() => setShowSizeChart(false)}
        />

        <div className={styles.splitWrapper}>
          <div className={styles.imageWrapper}>
            <div>
              <label>Front</label>
              <Image
                src={frontImage}
                alt={`image of jersey style ${frontImage}`}
                width={250}
                height={250}
              />
            </div>
            <div>
              <label>Back</label>
              <Image
                src={backImage}
                alt={`image of jersey style ${backImage}`}
                width={250}
                height={250}
              />
            </div>
          </div>

          <div className={styles.formWrapper}>
            <form onSubmit={handleSubmit} noValidate aria-live="assertive">
              {error && (
                <Alert
                  heading={"Oh no!"}
                  message={error}
                  type="error"
                  onClose={() => setError("")}
                />
              )}

              <div className={`${styles.formRow} ${styles.priceRow}`}>
                {/* TODO: calculate conversion for international */}
                {discounts.percent !== 0 || discounts.salePrice !== 0 ?
                <div className={styles.salePrice}>
                  <p className={styles.strikethrough}>${discounts.reg}</p>
                  {discounts.percent !== 0 ?
                  <p>-{discounts.percent}%
                    <span className={styles.disclaimer}>{discounts.type}</span>
                  </p> : 
                  <p>{discounts.salePrice}
                    <span className={styles.disclaimer}>{discounts.type}</span>
                  </p>}
                  <p className={styles.finalPrice}>${price} USD</p>
                </div> : 
                <div className={styles.regularPrice}>
                  <p>${discounts.reg} USD</p>
                </div>}
                <span className={styles.disclaimer}>Tax and Shipping calculated at Checkout</span>
              </div>

              <div className={`${styles.formRow} ${styles.qtyWrapper}`}>
                <label>Quantity</label>
                <button
                  type="button"
                  className={styles.minus}
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                />
                <input type="hidden" name="qty" value={quantity} />
                <span>{quantity}</span>
                <button
                  className={styles.plus}
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(5, prev + 1))}
                  aria-label="Increase quantity"
                  disabled={quantity >= 5}
                />
              </div>

              <div className={styles.formRow}>
                <label htmlFor="size">Size</label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={styles.select}
                  required
                >
                  <option value="" disabled>
                    Select One
                  </option>
                  {sizes.map((size, i: number) => {
                    return (
                      <option key={i} value={size}>
                        {size}
                      </option>
                    );
                  })}
                </select>
                {formErrors.size && (
                  <span className={styles.error}>{formErrors.size}</span>
                )}
              </div>

              <div className={styles.formRow}>
                <fieldset className={styles.fieldset}>
                  <legend>Color</legend>
                  <div className={styles.toggleGroup}>
                    {colors.map((color, i: number) => {
                      return (
                        <label key={i} className={styles.toggleOption}>
                          <input
                            type="radio"
                            name="color"
                            value={color}
                            checked={formData.color === color}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                          />

                          <span>{color}</span>
                        </label>
                      );
                    })}
                  </div>
                  {formErrors.color && (
                    <span className={styles.error}>{formErrors.color}</span>
                  )}
                  </fieldset>
              </div>

              <div className={styles.formRow}>
                <fieldset className={styles.fieldset}>
                  <legend>Cut</legend>
                  <div className={styles.toggleGroup}>
                    {cuts.map((cut, i: number) => {
                      return (
                        <label key={i} className={styles.toggleOption}>
                          <input
                            type="radio"
                            name="cut"
                            value={cut}
                            checked={formData.cut === cut}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                          />
                          <span>{cut}</span>
                        </label>
                      );
                    })}
                  </div>
                  {formErrors.cut && (
                    <span className={styles.error}>{formErrors.cut}</span>
                  )}
                </fieldset>
              </div>

              <div className={styles.formRow}>
                <label htmlFor="length">Length</label>
                  <select
                    id="length"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={styles.select}
                    required
                  >
                    <option value="" disabled>
                      Select One
                    </option>
                    {lengths.map((length, i: number) => {
                      return (
                        <option key={i} value={length}>
                          {length}
                        </option>
                      );
                    })}
                  </select>
                {formErrors.length && (
                  <span className={styles.error}>{formErrors.length}</span>
                )}
              </div>
              
                <div className={styles.formRow}>
                  <fieldset className={styles.fieldset}>
                    <legend>Neck Style</legend>
                    <div className={styles.toggleGroup}>
                      {neckStyles.map((neckStyle, i: number) => {
                        return (
                          <label key={i} className={styles.toggleOption}>
                            <input
                              type="radio"
                              name="neckStyle"
                              value={neckStyle}
                              checked={formData.neckStyle === neckStyle}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              required
                            />
                            <span>{neckStyle}</span>
                          </label>
                        );
                      })}
                    </div>

                    {formErrors.neckStyle && (
                      <span className={styles.error}>{formErrors.neckStyle}</span>
                    )}
                  </fieldset>
                </div>

                <div className={styles.formRow}>
                  <fieldset className={styles.fieldset}>
                    <legend>Back Style</legend>
                    <div className={styles.toggleGroup}>
                      {backStyles.map((backStyle, i: number) => {
                        return (
                          <label key={i} className={styles.toggleOption}>
                            <input
                              type="radio"
                              name="backStyle"
                              value={backStyle}
                              checked={formData.backStyle === backStyle}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              required
                            />

                            <span>{backStyle}</span>
                          </label>
                        );
                      })}
                    </div>
                    {formErrors.backStyle && (
                      <span className={styles.error}>{formErrors.backStyle}</span>
                    )}
                  </fieldset>
                </div>
              
              <div className={styles.formRow}>
                  <label htmlFor="jerseyNumber">Jersey Number</label>
                  <input
                    id="jerseyNumber"
                    name="jerseyNumber"
                    value={formData.jerseyNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Number"
                  ></input>
                  {formErrors.jerseyNumber && (
                    <span className={styles.error}>{formErrors.jerseyNumber}</span>
                  )}
                  <span className={styles.disclaimer}>Enter text here EXACTLY as you want your number to appear on the jersey. Any text in this field will be printed as written. Please do not include extra characters unless you wish these to be printed on your jersey.</span>
                </div>

                <div className={styles.formRow}>
                  <label htmlFor="jerseyName">Name on jersey Back</label>
                  <input
                    id="jerseyName"
                    name="jerseyName"
                    value={formData.jerseyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Name"
                  ></input>
                  {formErrors.jerseyName && (
                    <span className={styles.error}>{formErrors.jerseyName}</span>
                  )}
                  <span className={styles.disclaimer}>Enter text here EXACTLY as you want the name to appear on the jersey, or leave blank for no name. Any text in this field will be printed as written. Please do not include extra characters unless you wish these to be printed on your jersey.</span>
                </div>

                {/* TODO: Change to select with input for other option */}
                <div className={styles.formRow}>
                  <label htmlFor="pronouns">Pronouns</label>
                  <input
                    id="pronouns"
                    name="pronouns"
                    value={formData.pronouns}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Pronouns"
                  ></input>
                  <span className={styles.disclaimer}>Enter text here EXACTLY as you want it to appear on the jersey, or leave blank for no pronouns. Any text in this field will be printed as written. Please do not include extra characters unless you wish these to be printed on your jersey.</span>
                </div>


              <div className={styles.buttonRow}>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="button-primary arrow-button"
                >
                  {submitting ? (
                    "Adding to Cart..."
                  ) : (
                  //   this button needs to push the jersey order details to the cart
                    <>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
