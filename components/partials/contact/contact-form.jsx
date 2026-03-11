import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { apirequest } from "~/utils/api";
import DynamicComponent from "~/components/DynamicComponent";

const ContactForm = ({ content }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [loading, setLoading] = useState(false);

  // Log contents for debugging
  

  const onSubmit = async (data) => {
    const { name, email, message, contact } = data;

    setLoading(true);

    try {
      const response = await apirequest("POST", "/user/contactus", {
        name,
        email,
        message,
        contact,
      });

      setLoading(false);

      if (response) {
        toast.success("Message sent successfully!");
        reset();
      } else {
        toast.error("Failed to send message.");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Failed to send message.");
    }
  };

  // Helper function to get component data by name
  const getComponentData = (name) => {
    const comp = content.contents.find((item) => item.component.name === name);
    return {
      outerId: comp?.component.options.id || "",
      textId: comp?.component.components[0]?.options.id || "",
      text: comp?.component.components[0]?.options.text || "",
    };
  };

  // Extract title, description, and button data
  const titleData = getComponentData("title");
  const descriptionData = getComponentData("description");
  const buttonData = getComponentData("button");

  // Track used IDs
  const usedIds = new Set(
    [
      titleData.outerId,
      titleData.textId,
      descriptionData.outerId,
      descriptionData.textId,
      buttonData.outerId,
      buttonData.textId,
    ].filter((id) => id)
  );

  // Filter dynamic components
  const dynamicComponents = content.contents.filter(
    (item) => !usedIds.has(item.component?.options?.id)
  );

  // Log dynamic components
  

  return (
    <div className="col-lg-6" id={content.id}>
      {titleData.text && (
        <h2 className="title mb-1" id={titleData.textId}>
          {titleData.text}
        </h2>
      )}
      {descriptionData.text && (
        <p className="mb-2" id={descriptionData.textId}>
          {descriptionData.text}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="contact-form mb-3" style={{gap:"10px"}}>
        <div className="row">
          <div className="col-sm-6">
            <div htmlFor="cname">
              Name <span style={{ color: "red" }}>*</span>
            </div>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              id="cname"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="text-danger">{errors.name.message}</p>}
          </div>

          <div className="col-sm-6">
            <div htmlFor="cemail">
              Email <span style={{ color: "red" }}>*</span>
            </div>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              id="cemail"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-danger">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div htmlFor="cphone">
              Phone <span style={{ color: "red" }}>*</span>
            </div>
            <input
              type="tel"
              className={`form-control ${errors.contact ? "is-invalid" : ""}`}
              id="cphone"
              {...register("contact", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Invalid phone number",
                },
              })}
            />
            {errors.contact && (
              <p className="text-danger">{errors.contact.message}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <div htmlFor="cmessage">
            Message <span style={{ color: "red" }}>*</span>
          </div>
          <textarea
            className={`form-control ${errors.message ? "is-invalid" : ""}`}
            cols="30"
            rows="4"
            id="cmessage"
            {...register("message", {
              required: "Message is required",
            })}
          ></textarea>
          {errors.message && (
            <p className="text-danger">{errors.message.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-outline-primary-2 btn-minwidth-sm"
          id={buttonData.outerId || "id_btn_submit"}
          disabled={loading}
        >
          {loading ? "Submitting..." : buttonData.text || "Submit"}
          <i className="icon-long-arrow-right"></i>
        </button>
      </form>

      {/* Render dynamic components */}
      {dynamicComponents.length > 0 && (
        <div className="dynamic-components">
          {dynamicComponents.map((item, idx) => (
            <DynamicComponent
              key={item.component?.options?.id || `dynamic-${idx}`}
              component={item.component}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactForm;




// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { toast } from "react-toastify";
// import { apirequest } from "~/utils/api";

// const ContactForm = ({ content }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm();
//   const [loading, setLoading] = useState(false);

//   const onSubmit = async (data) => {
//     const { name, email, message, contact } = data;

//     setLoading(true);

//     try {
//       const response = await apirequest("POST", "/user/contactus", {
//         name,
//         email,
//         message,
//         contact,
//       });

//       setLoading(false);

//       if (response) {
//         toast.success("Message sent successfully!");
//         reset();
//       } else {
//         toast.error("Failed to send message.");
//       }
//     } catch (error) {
//       setLoading(false);
//       toast.error("Failed to send message.");
//     }
//   };

//   const getOptionById = (id) => {
//     for (const item of content.contents) {
//       if (item.component?.options?.id === id) {
//         return item.component.components?.[0]?.options?.text;
//       }
//       for (const child of item.component?.components || []) {
//         if (child.options?.id === id) {
//           return child.options?.text;
//         }
//       }
//     }
//     return "";
//   };

//   const title = getOptionById("id_text789");
//   const description = getOptionById("id_text345");
//   const button_label = getOptionById("id_btn_submit") || "Submit"; // optional button ID if exists in JSON

//   return (
//     <div className="col-lg-6" id={content.id}>
//       <h2 className="title mb-1" id="id_text789">{title}</h2>
//       <p className="mb-2" id="id_text345">{description}</p>

//       <form onSubmit={handleSubmit(onSubmit)} className="contact-form mb-3">
//         <div className="row">
//           <div className="col-sm-6">
//             <label htmlFor="cname" className="sr-only">
//               Name
//             </label>
//             <input
//               type="text"
//               className={`form-control ${errors.name ? "is-invalid" : ""}`}
//               id="cname"
//               placeholder="Name *"
//               {...register("name", { required: "Name is required" })}
//             />
//             {errors.name && (
//               <p className="text-danger">{errors.name.message}</p>
//             )}
//           </div>

//           <div className="col-sm-6">
//             <label htmlFor="cemail" className="sr-only">
//               Email
//             </label>
//             <input
//               type="email"
//               className={`form-control ${errors.email ? "is-invalid" : ""}`}
//               id="cemail"
//               placeholder="Email *"
//               {...register("email", {
//                 required: "Email is required",
//                 pattern: {
//                   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                   message: "Invalid email address",
//                 },
//               })}
//             />
//             {errors.email && (
//               <p className="text-danger">{errors.email.message}</p>
//             )}
//           </div>
//         </div>

//         <div className="row">
//           <div className="col-sm-12">
//             <label htmlFor="cphone" className="sr-only">
//               Phone
//             </label>
//             <input
//               type="tel"
//               className={`form-control ${errors.contact ? "is-invalid" : ""}`}
//               id="cphone"
//               placeholder="Phone"
//               {...register("contact", {
//                 required: "Phone number is required",
//                 pattern: {
//                   value: /^[0-9]{10}$/,
//                   message: "Invalid phone number",
//                 },
//               })}
//             />
//             {errors.contact && (
//               <p className="text-danger">{errors.contact.message}</p>
//             )}
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="cmessage" className="sr-only">
//             Message
//           </label>
//           <textarea
//             className={`form-control ${errors.message ? "is-invalid" : ""}`}
//             cols="30"
//             rows="4"
//             id="cmessage"
//             placeholder="Message *"
//             {...register("message", {
//               required: "Message is required",
//             })}
//           ></textarea>
//           {errors.message && (
//             <p className="text-danger">{errors.message.message}</p>
//           )}
//         </div>

//         <button
//           type="submit"
//           className="btn btn-outline-primary-2 btn-minwidth-sm"
//           id="id_btn_submit"
//           disabled={loading}
//         >
//           {loading ? "Submitting..." : button_label}
//           <i className="icon-long-arrow-right"></i>
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ContactForm;






