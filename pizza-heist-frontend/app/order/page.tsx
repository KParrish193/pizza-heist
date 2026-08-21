"use client";

import Image from "next/image";
import Alert from '../components/ux/alert/alert';
import { useState, useEffect } from "react";
import styles from "./order.module.css";

interface FormData {
  timestamp: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  jobType: string;
  description: string;
};

interface FormErrors {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  jobType: string;
  description: string;
}

export default function Contact() {
  const [services, setServices] = useState<string[]>([]);

  // initiate form state
  const [formData, setFormData] = useState<FormData>({
    timestamp: new Date().toISOString(),
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    jobType: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobType: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // set services dropdown dynamically
  useEffect(() => {
    async function loadServices() {
      const res = await fetch("/api/services");
      const data: Record<string, string>[] = await res.json();

      const filteredData = data
        .map((row) => row["Services"])
        .filter(Boolean) as string[]; // cast ensures TypeScript knows it’s string[]

      setServices(filteredData);
    }

    loadServices();
  }, []);

  // validation functions
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone: string) =>
    /^\d{10}$/.test(phone.replace(/\D/g, ""));

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
        return value.trim() ? "" : "First name is required";
      case "lastName":
        return value.trim() ? "" : "Last name is required";
      case "email":
        if (!value.trim()) return "E-mail is required";
        return validateEmail(value) ? "" : "Invalid e-mail address";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        return validatePhone(value) ? "" : "Invalid phone number";
      case "jobType":
        return value ? "" : "Please select a service type";
      case "description":
        return value.trim() ? "" : "Description is required";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      jobType: validateField("jobType", formData.jobType),
      description: validateField("description", formData.description),
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

    // Validate this field now that user left it
    setFormErrors({ ...formErrors, [name]: validateField(name, value) });
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    const len = digits.length;

    if (len === 0) return "";
    if (len < 4) return digits;
    if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === "phone") {
        formattedValue = formatPhoneNumber(value);
    }
    setFormData({ ...formData, [name]: formattedValue });
    setFormErrors({ ...formErrors, [name]: validateField(name, value) });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const isValid = validateForm(); // runs all field-level checks
    if (!isValid) {
      setError("Please fix the errors in the form before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit form");

      setSuccess(
        "Your message is on its way - we’ll get back to you shortly!"
      );
      setFormData({
        timestamp: new Date().toISOString(),
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        jobType: "",
        description: "",
      });
      setFormErrors({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        jobType: "",
        description: "",
      });
    } catch (err) {
      setError(`Something went wrong. ${err}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  // Disable submit during submit
  const isSubmitDisabled = submitting

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        
          <div className={styles.desktopImg}>
            <video autoPlay muted playsInline loop>
              <source src="/videos/timelapse.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>

        <div className={styles.formWrapper}>
          <h1>How Can We Help You?</h1>
          <form onSubmit={handleSubmit} noValidate aria-live="assertive">
            {error && (
              <Alert
                heading={"Uh Oh!"}
                message={error}
                type="error"
                onClose={() => setError("")}
              />
            )}
            {success && (
              <Alert
                heading={"Thank You!"}
                message={success}
                type="success"
                onClose={() => setSuccess("")}
              />
            )}

            {/* Hidden timestamp */}
            <input type="hidden" name="timestamp" value={formData.timestamp} />

            <div className={styles.formRow}>
              <div>
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="First"
                ></input>
                {formErrors.firstName && (
                  <span className={styles.error}>{formErrors.firstName}</span>
                )}
              </div>
              <div>
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Last"
                ></input>
                {formErrors.lastName && (
                  <span className={styles.error}>{formErrors.lastName}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div>
                <label htmlFor="phone">Contact Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="(555) 555-555"
                ></input>
                {formErrors.phone && (
                  <span className={styles.error}>{formErrors.phone}</span>
                )}
              </div>
              <div>
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="hi@myemail.com"
                ></input>
                {formErrors.email && (
                  <span className={styles.error}>{formErrors.email}</span>
                )}
              </div>
            </div>

            <div className={`${styles.formRow} ${styles.fullWidth}`}>
              <div>
                <label htmlFor="jobType">Service Type</label>
                {/* <div className={styles.selectWrapper}> */}
                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={styles.select}
                    required
                  >
                    <option value="" disabled>
                      Select One
                    </option>
                    {services.map((service, i: number) => {
                      return (
                        <option key={i} value={service}>
                          {service}
                        </option>
                      );
                    })}
                    <option value="Other">Other</option>
                  </select>
                {/* </div> */}
                {formErrors.jobType && (
                  <span className={styles.error}>{formErrors.jobType}</span>
                )}
              </div>
            </div>
            <div className={`${styles.formRow} ${styles.fullWidth}`}>
              <div>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="How can we help?"
                ></textarea>
                {formErrors.description && (
                  <span className={styles.error}>{formErrors.description}</span>
                )}
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="button-primary arrow-button"
              >
                {submitting ? (
                  "Sending..."
                ) : (
                //   this button needs to push the jersey order details to the cart
                  <>
                    Add to Cart
                    {/* icon? */}
                    <Image
                      src={"/icons/arrow.svg"}
                      alt={"arrow"}
                      width={10}
                      height={10}
                    />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
1