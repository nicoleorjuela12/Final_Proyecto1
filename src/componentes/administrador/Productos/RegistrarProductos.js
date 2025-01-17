import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faDollarSign, faList, faCamera, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import axios from "axios";


const RegistroProductos = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    imagen: "",
    categoria: "",
    estado: "activo",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "precio") {
      const formattedValue = formatPrice(value);
      setFormData((prevState) => ({ ...prevState, [name]: formattedValue }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleClearImageURL = () => {
    setFormData((prevState) => ({ ...prevState, imagen: "" }));
  };

  const formatPrice = (value) => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const isValidURL = (url) => {
    const regex = /^(https?:\/\/)?([\w\d]+\.)+[\w\d]{2,}(\/[\w\d\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
    return regex.test(url);
  };

  const checkProductExists = async (nombre) => {
    try {
      const response = await axios.post("http://localhost:8000/usuarios/verificar-producto", { nombre });
      return response.data.existe; // Retornamos si el producto ya existe
    } catch (error) {
      Swal.fire("Error", "Error en la conexión con el servidor", "error");
      return false;
    }
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Establecer la fecha de registro
    setFormData((prevState) => ({
      ...prevState,
      fechaRegistro: new Date().toISOString(),
    }));
  
    // Validación de campos
    if (!formData.nombre || !formData.precio || !formData.categoria || !formData.descripcion || !formData.imagen) {
      Swal.fire("Error", "Por favor completa todos los campos", "error");
      return;
    }
  
    if (!isValidURL(formData.imagen)) {
      Swal.fire("Error", "El enlace de la imagen no es válido", "error");
      return;
    }
  
    // Validación adicional de campos
    if (formData.descripcion.length > 300) {
      Swal.fire("Error", "La descripción no puede exceder los 300 caracteres", "error");
      return;
    }
  
    if (/[^a-zA-Z\s]/.test(formData.nombre) || formData.nombre.length > 70) {
      Swal.fire("Error", "El nombre solo puede contener letras y no exceder los 70 caracteres", "error");
      return;
    }
  
    // Convertir el precio a un número sin puntos antes de enviar
    const numericPrice = parseInt(formData.precio.replace(/\./g, ""), 10);
    if (isNaN(numericPrice) || numericPrice < 7000 || numericPrice > 200000) {
      Swal.fire("Error", "El precio debe estar entre 7,000 y 200,000", "error");
      return;
    }
  
    // Verificar si el producto ya existe
    const productExists = await checkProductExists(formData.nombre);
    if (productExists) {
      Swal.fire("Error", "El producto ya está registrado", "error");
      return;
    }
  
    try {
      // Datos a enviar sin puntos en el precio
      const dataToSend = {
        ...formData,
        precio: numericPrice, // Aquí se envía el precio como número sin puntos
      };
  
      // Registrando el producto
      const response = await axios.post("http://localhost:8000/usuarios/registrar-producto", dataToSend);
  
      if (response.status === 200) {
        Swal.fire("Éxito", "Producto registrado exitosamente", "success");
        setFormData({
          nombre: "",
          precio: "",
          descripcion: "",
          imagen: "",
          categoria: "",
          estado: "activo",
        });
      }else {
        Swal.fire("Éxito", "Producto registrado exitosamente", "success").then(() => {
          navigate("/GestionProductos"); // Cambia esto a la ruta correcta
        });
      }
    } catch (error) {
      Swal.fire("Error", "Error en la conexión con el servidor", "error");
    }
  };
  

  return (
    <div className="min-w-screen min-h-screen bg-gray-100 flex flex-col justify-between ">
      <div className="bg-white text-gray-700 -mt-8 border-2 border-yellow-400 rounded-3xl shadow-xl w-full max-w-7xl mx-auto overflow-hidden my-6 mt-14">
        <div className="md:flex w-full">
          {/* Contenedor para la imagen */}
          <div className="w-full md:w-1/2 h-64 py-6 px-6 flex justify-center items-center mt-48">
            {formData.imagen ? (
              <img
                src={formData.imagen}
                alt="Producto"
                className="w-full h-auto object-cover "
              />
            ) : (
              <p className="text-center text-gray-900 text-2xl">Previsualización de imagen</p>
            )}
          </div>

          {/* Formulario */}
          <div className="w-full md:w-1/2 py-6 px-4 md:px-6 shadow-lg">
            <div className="text-center mb-6">
              <h1 className="font-bold text-2xl text-yellow-600">Productos</h1>
              <p className="mt-1 text-gray-600">Registra un nuevo producto para que sea un éxito</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full md:w-1/3 px-3 mb-4 relative">
                  <label htmlFor="nombre" className="text-gray-900 font-semibold px-1">
                    Nombre
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faBox} className="absolute left-3 top-3 text-yellow-500" />
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-yellow-400 outline-none focus:border-yellow-600"
                      placeholder="Pastel"
                      maxLength="70"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-3 mb-4 relative">
                  <label htmlFor="precio" className="text-gray-900 font-semibold px-1">
                    Precio
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faDollarSign} className="absolute left-3 top-3 text-yellow-500" />
                    <input
                      type="number"
                      name="precio"
                      id="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      max="200000"
                      className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-yellow-400 outline-none focus:border-yellow-600"
                      placeholder="2500"
                    />
                  </div>
                  <p className="text-gray-600 mt-1 text-sm">Precio debe estar entre 7,000 y 200,000</p>
                </div>
                <div className="w-full md:w-1/3 px-3 mb-4 relative">
                  <label htmlFor="categoria" className="text-gray-900 font-semibold px-1">
                    Categoría
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faList} className="absolute left-3 top-3 text-yellow-500" />
                    <select
                      name="categoria"
                      id="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-yellow-400 outline-none focus:border-yellow-600"
                    >
                      <option value="">Seleccione una categoría</option>
                      <option value="entradas">Entradas</option>
                      <option value="plato fuerte">Plato Fuerte</option>
                      <option value="cocteles">Cocteles</option>
                      <option value="bebidas calientes">Bebidas Calientes</option>
                      <option value="bebidas frías">Bebidas Frías</option>
                      <option value="postres">Postres</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3 mb-4 relative">
                  <label htmlFor="descripcion" className="text-gray-900 font-semibold px-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="w-full h-24 pl-2 pr-3 py-2 rounded-lg border-2 border-yellow-400 outline-none focus:border-yellow-600"
                    placeholder="Descripción del producto"
                    maxLength="300"
                  />
                  <p className="text-gray-600 mt-1 text-sm">Máximo 300 caracteres</p>
                </div>
              </div>

              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3 mb-4 relative">
                  <label htmlFor="imagen" className="text-gray-900 font-semibold px-1">
                    Enlace de la imagen
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faCamera} className="absolute left-3 top-3 text-yellow-500" />
                    <input
                      type="text"
                      name="imagen"
                      id="imagen"
                      value={formData.imagen}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-yellow-400 outline-none focus:border-yellow-600"
                      placeholder="http://example.com/imagen.jpg"
                    />
                    {formData.imagen && (
                      <button
                        type="button"
                        onClick={handleClearImageURL}
                        className="absolute right-3 top-3 text-red-500"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50"
              >
                Registrar Producto
              </button>
            </form>
            
          </div>
    
        </div>
      </div>
    </div>
  );
};

export default RegistroProductos;
