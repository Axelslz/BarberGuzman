import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Popover,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import Carousel from "../components/Carousel";
import UserProfileModal from "../components/UserProfileModal";
import { getAboutInfo, updateAboutInfo } from "../services/aboutService";
import { useUser } from "../contexts/UserContext";

const MAX_IMAGES = 4;

function ResponsiveTextField({ 
  label, 
  name, 
  value, 
  onChange, 
  multiline = false, 
  rows = 1,
  placeholder = "",
  className = "" 
}) {
  const baseClasses = "w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-lg focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none";
  
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2 pl-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${baseClasses} min-h-[120px] max-h-[300px] overflow-y-auto leading-relaxed`}
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseClasses} break-words`}
        />
      )}
      
      {/* Decorative element */}
      <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg"></div>
    </div>
  );
}

function AboutPage() {
  const { isSuperAdmin, isLoadingProfile } = useUser();

  const [aboutContent, setAboutContent] = useState({
    titulo: "",
    parrafo1: "",
    parrafo2: "",
    imagenes: [],
  });
  const [originalAboutContent, setOriginalAboutContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [feedbackPopoverOpen, setFeedbackPopoverOpen] = useState(false);
  const [feedbackPopoverAnchorEl, setFeedbackPopoverAnchorEl] = useState(null);
  const [feedbackPopoverMessage, setFeedbackPopoverMessage] = useState("");
  const [feedbackPopoverSeverity, setFeedbackPopoverSeverity] =
    useState("info");

  const saveButtonRef = useRef(null);
  const addImageButtonRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setAnchorEl(null);
  };

  const showFeedbackPopover = (
    message,
    severity = "info",
    eventTarget = saveButtonRef.current
  ) => {
    setFeedbackPopoverMessage(message);
    setFeedbackPopoverSeverity(severity);
    setFeedbackPopoverAnchorEl(eventTarget);
    setFeedbackPopoverOpen(true);
  };

  const handleCloseFeedbackPopover = () => {
    setFeedbackPopoverOpen(false);
    setFeedbackPopoverAnchorEl(null);
    setFeedbackPopoverMessage("");
    setFeedbackPopoverSeverity("info");
  };

  const fetchAboutInformation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAboutInfo();
      const fetchedImages = [];

      for (let i = 1; i <= MAX_IMAGES; i++) {
        const imageUrlField = `imagen_url${i}`;
        if (data[imageUrlField]) {
          fetchedImages.push({
            id: `db_img_${i}`,
            url: data[imageUrlField],
            originalUrl: data[imageUrlField],
            file: null,
            markedForDeletion: false,
          });
        }
      }

      setAboutContent({
        titulo: data.titulo,
        parrafo1: data.parrafo1,
        parrafo2: data.parrafo2,
        imagenes: fetchedImages,
      });

      setOriginalAboutContent({
        titulo: data.titulo,
        parrafo1: data.parrafo1,
        parrafo2: data.parrafo2,
        imagenes: fetchedImages.map((img) => ({ ...img })),
      });
    } catch (err) {
      console.error("Error al cargar la información 'Sobre Mí':", err);
      setError("Error al cargar la información. Intente de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutInformation();
  }, [fetchAboutInformation]);

  useEffect(() => {
    return () => {
      aboutContent.imagenes.forEach((img) => {
        if (img.url && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [aboutContent.imagenes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAboutContent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNewImage = () => {
    if (aboutContent.imagenes.length < MAX_IMAGES) {
      setAboutContent((prev) => ({
        ...prev,
        imagenes: [
          ...prev.imagenes,
          {
            id: `new_img_${Date.now()}`,
            url: "https://placehold.co/800x400?text=Nueva+Imagen",
            file: null,
            originalUrl: null,
            markedForDeletion: false,
          },
        ],
      }));
    } else {
      showFeedbackPopover(
        `Has alcanzado el límite máximo de ${MAX_IMAGES} imágenes.`,
        "warning",
        addImageButtonRef.current || saveButtonRef.current
      );
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      setAboutContent((prev) => {
        const newImages = [...prev.imagenes];
        if (newImages[index]?.url?.startsWith("blob:")) {
          URL.revokeObjectURL(newImages[index].url);
        }
        newImages[index] = {
          ...newImages[index],
          url: URL.createObjectURL(file),
          file: file,
          markedForDeletion: false,
        };
        return { ...prev, imagenes: newImages };
      });
    }
  };

  const handleRemoveImage = (index) => {
    if (
      aboutContent.imagenes.length <= 1 &&
      originalAboutContent?.imagenes?.length === 0
    ) {
      showFeedbackPopover(
        "No se puede eliminar la última imagen si no hay ninguna guardada en la base de datos. Debes tener al menos una.",
        "error",
        saveButtonRef.current
      );
      return;
    }

    setAboutContent((prev) => {
      const newImages = [...prev.imagenes];
      const removedImage = newImages[index];

      if (removedImage?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(removedImage.url);
      }

      newImages.splice(index, 1);

      return { ...prev, imagenes: newImages };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("titulo", aboutContent.titulo);
      formData.append("parrafo1", aboutContent.parrafo1);
      formData.append("parrafo2", aboutContent.parrafo2);

      const imagesToDelete = [];

      if (originalAboutContent && originalAboutContent.imagenes) {
        originalAboutContent.imagenes.forEach((originalImg) => {
          const foundInCurrent = aboutContent.imagenes.some(
            (currentImg) =>
              currentImg.originalUrl === originalImg.originalUrl ||
              (currentImg.file &&
                originalImg.originalUrl &&
                currentImg.originalUrl === originalImg.originalUrl)
          );
          if (!foundInCurrent) {
            imagesToDelete.push(originalImg.originalUrl);
          }
        });
      }

      aboutContent.imagenes.forEach((img, index) => {
        if (img.file) {
          formData.append(`newImage_${index}`, img.file);
          if (img.originalUrl && !imagesToDelete.includes(img.originalUrl)) {
            imagesToDelete.push(img.originalUrl);
          }
        } else if (img.originalUrl) {
          formData.append(`existingImageUrl_${index}`, img.originalUrl);
        }
      });

      if (imagesToDelete.length > 0) {
        formData.append("deletedImageUrls", JSON.stringify(imagesToDelete));
      }

      await updateAboutInfo(formData);

      showFeedbackPopover(
        "Información actualizada exitosamente!",
        "success",
        saveButtonRef.current
      );

      setIsEditing(false);
      fetchAboutInformation();
    } catch (err) {
      console.error("Error al guardar la información 'Sobre Mí':", err);
      setError(
        `Error al guardar la información: ${
          err.message || "Verifique la consola para más detalles."
        }`
      );
      showFeedbackPopover(
        `Error al guardar la información: ${
          err.message || "Verifique la consola para más detalles."
        }`,
        "error",
        saveButtonRef.current
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    aboutContent.imagenes.forEach((img) => {
      if (img.url && img.url.startsWith("blob:") && img.file) {
        URL.revokeObjectURL(img.url);
      }
    });

    setAboutContent(originalAboutContent);
    setIsEditing(false);
    setError(null);
  };

  const carouselDisplayItems = aboutContent.imagenes.map((img) => ({
    image: img.url,
    id: img.id,
  }));

  if (loading && !originalAboutContent) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="bg-white rounded-3xl p-12 shadow-2xl border border-amber-200">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
              <span className="text-2xl">✂️</span>
            </div>
            <CircularProgress sx={{ color: "#D4AF37" }} />
            <p className="text-lg font-semibold text-gray-700">
              Cargando información...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Header toggleMenu={toggleMenu} />
      <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

      {/* Contenedor principal con scroll suave */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            {/* Header con título y botón de edición */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                {isEditing && isSuperAdmin ? (
                  <div className="relative w-full max-w-2xl">
                    <ResponsiveTextField
                      label="Título Principal"
                      name="titulo"
                      value={aboutContent.titulo}
                      onChange={handleChange}
                      placeholder="Ingresa el título principal..."
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold  bg-slate-700 bg-clip-text text-transparent break-words text-center max-w-4xl">
                    {aboutContent.titulo || "Bienvenidos a Guzman Peluqueria"}
                  </h1>
                )}

                {isSuperAdmin && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center flex-shrink-0"
                  >
                    {isEditing ? <SaveIcon /> : <EditIcon />}
                  </button>
                )}
              </div>

              {/* Línea decorativa */}
              <div className="flex justify-center">
                <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-full"></div>
              </div>
            </div>

            {/* Contenido principal - Grid responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Columna de texto - Izquierda */}
              <div className="space-y-6 lg:pr-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500">
                  {isEditing && isSuperAdmin ? (
                    <div className="space-y-6">
                      {/* Campo para párrafo 1 */}
                      <div className="relative">
                        <ResponsiveTextField
                          label="Primer Párrafo"
                          name="parrafo1"
                          value={aboutContent.parrafo1}
                          onChange={handleChange}
                          multiline={true}
                          rows={6}
                          placeholder="Escribe el primer párrafo de tu presentación. Puedes incluir información sobre tu experiencia, servicios principales, o lo que hace especial a tu barbería..."
                        />
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                      </div>

                      {/* Campo para párrafo 2 */}
                      <div className="relative">
                        <ResponsiveTextField
                          label="Segundo Párrafo"
                          name="parrafo2"
                          value={aboutContent.parrafo2}
                          onChange={handleChange}
                          multiline={true}
                          rows={6}
                          placeholder="Continúa con más detalles sobre tu barbería. Puedes mencionar tu filosofía de trabajo, productos que utilizas, o invitar a los clientes a visitarte..."
                        />
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full shadow-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                      </div>

                      {/* Contador de caracteres */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-500">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <span>Párrafo 1: {aboutContent.parrafo1?.length || 0} caracteres</span>
                          <span>Párrafo 2: {aboutContent.parrafo2?.length || 0} caracteres</span>
                        </div>
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          📝 Modo edición
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold"></span>
                        </div>
                        <div className="pl-6 pr-4">
                          <p className="text-gray-700 leading-relaxed text-base sm:text-lg break-words whitespace-pre-wrap word-wrap overflow-wrap-anywhere">
                            {aboutContent.parrafo1 ||
                              "Somos un equipo de barberos apasionados por el arte del cuidado masculino. Ofrecemos cortes modernos, afeitados clásicos y tratamientos de barba personalizados para que siempre luzcas tu mejor versión."}
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold"></span>
                        </div>
                        <div className="pl-6 pr-4">
                          <p className="text-gray-700 leading-relaxed text-base sm:text-lg break-words whitespace-pre-wrap word-wrap overflow-wrap-anywhere">
                            {aboutContent.parrafo2 ||
                              "En nuestra barbería, la tradición se encuentra con la innovación. Utilizamos productos de alta calidad y técnicas vanguardistas para garantizar resultados excepcionales y una experiencia inigualable en cada visita. ¡Te esperamos para transformar tu estilo!"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Elementos decorativos */}
                <div className="hidden lg:block">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-amber-400 rounded-full shadow-lg animate-pulse"></div>
                      <div className="w-3 h-3 bg-orange-400 rounded-full shadow-lg animate-pulse delay-150"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg animate-pulse delay-300"></div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-amber-400 to-transparent"></div>
                  </div>
                </div>
              </div>

              {/* Columna de carrusel - Derecha */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500">
                  <div className="relative">
                    {/* Decoración superior */}
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full shadow-lg flex items-center justify-center">
                      
                    </div>

                    {/* Título del carrusel */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 break-words">
                        Galería de Nuestro Trabajo
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 mx-auto rounded-full"></div>
                    </div>

                    {/* Carrusel */}
                    <div className="relative min-h-[300px] sm:min-h-[400px]">
                      {aboutContent.imagenes && (
                        <Carousel
                          items={carouselDisplayItems}
                          isEditing={isEditing}
                          handleImageChange={handleImageChange}
                          handleRemoveImage={handleRemoveImage}
                          isSuperAdmin={isSuperAdmin}
                          autoPlayInterval={5000}
                          onAddNewImage={handleAddNewImage}
                          maxImages={MAX_IMAGES}
                        />
                      )}
                    </div>

                    {/* Botón de agregar imagen */}
                    {isEditing && isSuperAdmin && (
                      <div className="mt-6 text-center">
                        <button
                          ref={addImageButtonRef}
                          onClick={handleAddNewImage}
                          disabled={aboutContent.imagenes.length >= MAX_IMAGES}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 break-words ${
                            aboutContent.imagenes.length >= MAX_IMAGES
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                          }`}
                        >
                          <span className="flex flex-wrap items-center justify-center gap-2">
                            <span>📷</span>
                            <span className="whitespace-nowrap">Añadir Nueva Imagen</span>
                            <span className="text-sm opacity-75 whitespace-nowrap">
                              ({aboutContent.imagenes.length}/{MAX_IMAGES})
                            </span>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción - Fixed en la parte inferior */}
            {isEditing && isSuperAdmin && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/50">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      ref={saveButtonRef}
                      onClick={handleSave}
                      disabled={loading}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <CircularProgress size={20} sx={{ color: "white" }} />
                      ) : (
                        <SaveIcon />
                      )}
                      <span className="whitespace-nowrap">
                        {loading ? "Guardando..." : "Guardar Cambios"}
                      </span>
                    </button>

                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <CancelIcon />
                      <span className="whitespace-nowrap">Cancelar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <UserProfileModal
        open={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        anchorEl={anchorEl}
      />

      <Popover
        open={feedbackPopoverOpen}
        anchorEl={feedbackPopoverAnchorEl}
        onClose={handleCloseFeedbackPopover}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            border: "none",
            overflow: "hidden",
          },
        }}
      >
        <div
          className={`px-6 py-4 ${
            feedbackPopoverSeverity === "success"
              ? "bg-gradient-to-r from-emerald-500 to-green-500"
              : feedbackPopoverSeverity === "error"
              ? "bg-gradient-to-r from-red-500 to-rose-500"
              : feedbackPopoverSeverity === "warning"
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-gradient-to-r from-blue-500 to-indigo-500"
          } text-white max-w-xs sm:max-w-md`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">
                {feedbackPopoverSeverity === "success"
                  ? "✅"
                  : feedbackPopoverSeverity === "error"
                  ? "❌"
                  : feedbackPopoverSeverity === "warning"
                  ? "⚠️"
                  : "ℹ️"}
              </span>
            </div>
            <Typography variant="body1" className="font-semibold break-words">
              {feedbackPopoverMessage}
            </Typography>
          </div>
        </div>
      </Popover>
    </div>
  );
}

export default AboutPage;