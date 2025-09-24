import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

function Carousel({ 
    items = [], 
    isEditing = false, 
    handleImageChange, 
    handleRemoveImage, 
    isSuperAdmin = false, 
    autoPlayInterval = 0, 
    onAddNewImage 
}) {
    const [activeStep, setActiveStep] = useState(0);
    const maxSteps = items.length;
    const fileInputRef = useRef(null);

    useEffect(() => {
        let timer;
        if (!isEditing && autoPlayInterval > 0 && maxSteps > 1) {
            timer = setInterval(() => {
                setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
            }, autoPlayInterval);
        }

        return () => {
            clearInterval(timer);
        };
    }, [maxSteps, autoPlayInterval, isEditing]);

    useEffect(() => {
        if (activeStep >= maxSteps && maxSteps > 0) {
            setActiveStep(maxSteps - 1);
        } else if (maxSteps === 0) {
            setActiveStep(0);
        }
    }, [maxSteps, activeStep]);

    const handleNext = () => {
        if (maxSteps > 0) {
            setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
        }
    };

    const handleBack = () => {
        if (maxSteps > 0) {
            setActiveStep((prevActiveStep) => (prevActiveStep - 1 + maxSteps) % maxSteps);
        }
    };

    const handleReplaceCurrentImg = (e) => {
        handleImageChange(e, activeStep);
    };

    const currentItem = items.length > 0 ? items[activeStep] : null;

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[350px] md:min-h-[400px] relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Hidden file input for replacing current image */}
            <input
                accept="image/*"
                className="hidden"
                id={`replace-image-input-${activeStep}`}
                type="file"
                ref={fileInputRef}
                onChange={handleReplaceCurrentImg}
            />

            {/* Add New Image Button - Floating in top right */}
            {isEditing && isSuperAdmin && items.length < 4 && (
                <button
                    onClick={onAddNewImage}
                    className="absolute top-4 right-4 z-20 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 group"
                    aria-label="Añadir nueva imagen"
                >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
            )}

            {currentItem ? (
                <>
                    {/* Main Image Container */}
                    <div
                        className={`relative w-full flex-grow flex flex-col items-center justify-center group ${
                            isEditing && isSuperAdmin ? 'cursor-pointer' : 'cursor-default'
                        } ${
                            isEditing && isSuperAdmin ? 'border-2 border-dashed border-gray-400 hover:border-blue-400 transition-colors duration-300' : ''
                        } rounded-xl overflow-hidden`}
                        onClick={isEditing && isSuperAdmin ? () => fileInputRef.current?.click() : null}
                    >
                        {/* Image with overlay effects */}
                        <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-xl">
                            <img
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                src={currentItem.image}
                                alt={`Imagen ${activeStep + 1}`}
                            />
                            
                            {/* Gradient overlay for better text visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                            
                            {/* Edit overlay that appears on hover */}
                            {isEditing && isSuperAdmin && (
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2 transform scale-95 group-hover:scale-100 transition-transform duration-300">
                                        <Camera className="w-5 h-5 text-gray-700" />
                                        <span className="text-gray-700 font-medium text-sm">Cambiar imagen</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action buttons for editing */}
                        {isEditing && isSuperAdmin && items.length > 0 && (
                            <div className="absolute bottom-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {items.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveImage(activeStep);
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300"
                                        aria-label="Eliminar imagen"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation and Indicators */}
                    {maxSteps > 1 && (
                        <div className="w-full flex items-center justify-between mt-6 px-4">
                            {/* Previous Button */}
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm"
                                disabled={maxSteps <= 1}
                            >
                                <ChevronLeft className="w-5 h-5" />
                                {isEditing && isSuperAdmin && <span className="text-sm hidden sm:inline">Anterior</span>}
                            </button>

                            {/* Dots Indicator */}
                            <div className="flex items-center gap-2">
                                {items.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveStep(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                            index === activeStep
                                                ? 'bg-white scale-125 shadow-lg'
                                                : 'bg-white/40 hover:bg-white/60'
                                        }`}
                                        aria-label={`Ir a imagen ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm"
                                disabled={maxSteps <= 1}
                            >
                                {isEditing && isSuperAdmin && <span className="text-sm hidden sm:inline">Siguiente</span>}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Image Counter */}
                    {maxSteps > 0 && (
                        <div className="mt-4">
                            <span className="text-white/80 text-sm font-medium bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                                {activeStep + 1} / {items.length}
                            </span>
                        </div>
                    )}
                </>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full w-full text-center p-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-full p-6 mb-6">
                        <Camera className="w-16 h-16 text-white/60" />
                    </div>
                    <h3 className="text-xl font-semibold text-white/90 mb-2">
                        No hay imágenes
                    </h3>
                    <p className="text-white/60 mb-6 max-w-sm">
                        Añade algunas imágenes para comenzar a crear tu galería
                    </p>
                    {isEditing && isSuperAdmin && (
                        <button
                            onClick={onAddNewImage}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Añadir primera imagen
                        </button>
                    )}
                </div>
            )}

            {/* Progress bar for auto-play */}
            {!isEditing && autoPlayInterval > 0 && maxSteps > 1 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse"
                        style={{
                            width: `${((activeStep + 1) / maxSteps) * 100}%`,
                            transition: 'width 0.3s ease-in-out'
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
}

export default Carousel;