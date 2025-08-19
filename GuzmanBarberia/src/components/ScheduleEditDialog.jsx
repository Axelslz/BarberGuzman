import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import moment from "moment";
import "moment/locale/es";
import appointmentService from "../services/appointmentService";

moment.locale("es");

function ScheduleEditDialog({
  open,
  onClose,
  barberId,
  barberName,
  selectedDate,
  initialAction,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentSchedule, setCurrentSchedule] = useState([]);
  const [unavailableBlocks, setUnavailableBlocks] = useState([]);
  const [newSlotTime, setNewSlotTime] = useState("");
  const [newSlotDuration, setNewSlotDuration] = useState("30");
  const [blockStartTime, setBlockStartTime] = useState("");
  const [blockEndTime, setBlockEndTime] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockFullDay, setBlockFullDay] = useState(false);

  // Nuevos estados para el modal de confirmación
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [blockToUnblock, setBlockToUnblock] = useState(null);

  const appointmentsRef = useRef(null);
  const availableSlotsRef = useRef(null);
  const addSlotRef = useRef(null);
  const blockTimeRef = useRef(null);

  const fetchBarberSchedule = useCallback(async () => {
    if (!barberId || !selectedDate) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getBarberAvailability(
        barberId,
        selectedDate
      );

      let slots = [];
      let unavailable = [];

      if (
        response &&
        response.disponibilidad &&
        response.horariosNoDisponibles
      ) {
        slots = response.disponibilidad;
        unavailable = response.horariosNoDisponibles;
      } else if (response && Array.isArray(response)) {
        slots = response.filter((slot) => !slot.es_bloqueo_manual);
        unavailable = response.filter((slot) => slot.es_bloqueo_manual);
      } else {
        setError(
          "No se pudo cargar el horario actual. Formato de datos inesperado de la API."
        );
        return;
      }

      const actualAppointments = slots.filter(
        (slot) => !slot.disponible && slot.cita_id
      );
      const actualAvailableSlots = slots.filter(
        (slot) => slot.disponible && !slot.es_bloqueo_manual
      );

      setCurrentSchedule(actualAppointments.concat(actualAvailableSlots));
      setUnavailableBlocks(unavailable);
    } catch (err) {
      setError(
        `Error al cargar el horario del barbero: ${
          err.response?.data?.message || err.message || "Error desconocido"
        }`
      );
      console.error("Error fetching barber schedule for edit:", err);
    } finally {
      setLoading(false);
    }
  }, [barberId, selectedDate]);

  useEffect(() => {
    if (open) {
      fetchBarberSchedule();
      setNewSlotTime("");
      setNewSlotDuration("30");
      setBlockStartTime("");
      setBlockEndTime("");
      setBlockReason("");
      setBlockFullDay(false);
      setError(null);
      setSuccess(null);

      if (initialAction) {
        setTimeout(() => {
          switch (initialAction) {
            case "viewAppointments":
              appointmentsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              break;
            case "editAvailableSlots":
              availableSlotsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              break;
            case "blockTime":
              blockTimeRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              break;
            default:
              break;
          }
        }, 100);
      }
    }
  }, [open, fetchBarberSchedule, initialAction]);

  // Función para abrir el modal de confirmación de cancelación de cita
  const handleOpenCancelConfirm = (appointmentId) => {
    setAppointmentToCancel(appointmentId);
    setOpenConfirmModal(true);
  };

  // Función para abrir el modal de confirmación de eliminación de slot
  const handleOpenDeleteConfirm = (slotId) => {
    setSlotToDelete(slotId);
    setOpenConfirmModal(true);
  };

  // Función para abrir el modal de confirmación de liberar bloqueo
  const handleOpenUnblockConfirm = (blockId) => {
    setBlockToUnblock(blockId);
    setOpenConfirmModal(true);
  };

  // Lógica para el botón "Aceptar" del modal de confirmación
  const handleConfirmAction = async () => {
    setLoading(true);
    setOpenConfirmModal(false);
    setError(null);
    setSuccess(null);

    try {
      if (appointmentToCancel) {
        await appointmentService.updateAppointment(appointmentToCancel, {
          nuevoEstado: "cancelada",
        });
        setSuccess("Cita cancelada y horario liberado exitosamente.");
      } else if (slotToDelete) {
        await appointmentService.deleteBarberScheduleSlot(slotToDelete);
        setSuccess("Horario disponible eliminado exitosamente.");
      } else if (blockToUnblock) {
        await appointmentService.unblockBarberTime(blockToUnblock);
        setSuccess("Bloqueo de horario liberado exitosamente.");
      }
      fetchBarberSchedule();
    } catch (err) {
      setError(
        `Error: ${
          err.response?.data?.message || err.message || "Error desconocido"
        }`
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
      setAppointmentToCancel(null);
      setSlotToDelete(null);
      setBlockToUnblock(null);
    }
  };

  // Lógica para el botón "Cancelar" del modal de confirmación
  const handleCloseConfirm = () => {
    setOpenConfirmModal(false);
    setAppointmentToCancel(null);
    setSlotToDelete(null);
    setBlockToUnblock(null);
  };

  const handleAddSlot = async () => {
    if (!newSlotTime || !moment(newSlotTime, "HH:mm").isValid()) {
      setError(
        "Por favor, introduce una hora válida para el nuevo slot (HH:mm)."
      );
      return;
    }
    if (!newSlotDuration || isNaN(parseInt(newSlotDuration))) {
      setError("Por favor, selecciona una duración válida para el nuevo slot.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await appointmentService.addBarberScheduleSlot(
        barberId,
        selectedDate,
        newSlotTime,
        newSlotDuration
      );
      setSuccess("Nuevo horario disponible añadido exitosamente.");
      setNewSlotTime("");
      setNewSlotDuration("30");
      fetchBarberSchedule();
    } catch (err) {
      setError(
        `Error al añadir el horario: ${
          err.response?.data?.message || err.message || "Error desconocido"
        }`
      );
      console.error("Error adding new slot:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockTime = async () => {
    if (!blockFullDay) {
      if (!blockStartTime || !moment(blockStartTime, "HH:mm").isValid()) {
        setError(
          "Por favor, introduce una hora de inicio válida para el bloqueo (HH:mm)."
        );
        return;
      }
      if (blockEndTime && !moment(blockEndTime, "HH:mm").isValid()) {
        setError(
          "Por favor, introduce una hora de fin válida para el bloqueo (HH:mm)."
        );
        return;
      }
      if (
        blockStartTime &&
        blockEndTime &&
        moment(blockStartTime, "HH:mm").isSameOrAfter(
          moment(blockEndTime, "HH:mm")
        )
      ) {
        setError(
          "La hora de inicio debe ser anterior a la hora de fin para el bloqueo."
        );
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const blockData = {
        id_barbero: barberId,
        fecha: selectedDate,
        hora_inicio: blockFullDay ? null : blockStartTime,
        hora_fin: blockFullDay ? null : blockEndTime,
        motivo: blockReason,
        dia_completo: blockFullDay,
      };

      console.log("Datos que se enviarán al backend para bloquear:", blockData);
      await appointmentService.blockBarberTime(blockData);

      setSuccess("Horario bloqueado exitosamente.");
      setBlockStartTime("");
      setBlockEndTime("");
      setBlockReason("");
      setBlockFullDay(false);
      fetchBarberSchedule();
    } catch (err) {
      setError(
        `Error al bloquear el horario: ${
          err.response?.data?.message || err.message || "Error desconocido"
        }`
      );
      console.error("Error blocking time:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateDurationOptions = () => {
    const durations = [15, 30, 45, 60, 90, 120];
    return durations.map((d) => (
      <MenuItem key={d} value={d.toString()}>{`${d} minutos`}</MenuItem>
    ));
  };

  return (
    <>
      {/* Modal principal */}
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        {/* Encabezado */}
        <DialogTitle className="bg-gray-900 text-yellow-500 font-semibold text-lg">
          Editar Horario para {barberName} ({selectedDate})
        </DialogTitle>

        {/* Contenido */}
        <DialogContent dividers className="bg-gray-50">
          {loading && <CircularProgress className="text-yellow-500 mb-3" />}
          {error && (
            <Alert severity="error" className="mb-3">
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" className="mb-3">
              {success}
            </Alert>
          )}

          {/* Ver Citas Agendadas */}
          {initialAction === "viewAppointments" && (
            <div>
              <Alert severity="info" className="mb-3">
                Visualizando citas agendadas. Puedes cancelarlas si es
                necesario.
              </Alert>
              <h2
                className="text-lg font-semibold text-gray-800 mb-2"
                ref={appointmentsRef}
              >
                Horarios de Citas Agendadas
              </h2>
              <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
                {currentSchedule.filter(
                  (slot) => !slot.disponible && slot.cita_id
                ).length > 0 ? (
                  currentSchedule
                    .filter((slot) => !slot.disponible && slot.cita_id)
                    .map((slot) => (
                      <div
                        key={slot.cita_id || slot.hora_inicio_24h}
                        className="flex justify-between items-center border-b py-2 px-1 text-gray-700"
                      >
                        <span>
                          {moment(slot.hora_inicio_24h, "HH:mm").format(
                            "h:mm A"
                          )}{" "}
                          -
                          <span className="font-bold text-red-600">
                            {" "}
                            OCUPADO
                          </span>
                          (Cita: {slot.cliente_nombre || "Desconocido"})
                        </span>
                        {slot.cita_id && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              handleOpenCancelConfirm(slot.cita_id)
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-center text-gray-500 py-3">
                    No hay citas agendadas para este día.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Editar Horarios Disponibles */}
          {initialAction === "editAvailableSlots" && (
            <div>
              <Alert severity="info" className="mb-3">
                Administra tus horarios disponibles o añade nuevos.
              </Alert>
              <h2
                className="text-lg font-semibold text-gray-800 mb-2"
                ref={availableSlotsRef}
              >
                Horarios Disponibles del Día
              </h2>
              <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
                {currentSchedule.filter(
                  (slot) => slot.disponible && !slot.es_bloqueo_manual
                ).length > 0 ? (
                  currentSchedule
                    .filter(
                      (slot) => slot.disponible && !slot.es_bloqueo_manual
                    )
                    .map((slot) => (
                      <div
                        key={slot.slot_id || slot.hora_inicio_24h}
                        className="flex justify-between items-center border-b py-2 px-1 text-gray-700"
                      >
                        <span>
                          {moment(slot.hora_inicio_24h, "HH:mm").format(
                            "h:mm A"
                          )}{" "}
                          - Disponible ({slot.duracion_minutos || "N/A"} min)
                        </span>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDeleteConfirm(slot.slot_id)}
                          className="text-red-600 border border-red-600 hover:bg-red-100 px-3 py-1 rounded"
                        >
                          Eliminar
                        </Button>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-gray-500 py-3">
                    No hay horarios disponibles para este día.
                  </p>
                )}
              </div>

              <hr className="my-4 border-gray-300" />

              {/* Añadir nuevo slot */}
              <h2
                className="text-lg font-semibold text-gray-800 mb-2"
                ref={addSlotRef}
              >
                Añadir Nuevo Horario Disponible
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 items-center">
                  <TextField
                    label="Hora de inicio (HH:mm)"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    placeholder="Ej. 13:00"
                    className="flex-1"
                  />
                  <FormControl className="min-w-[120px]">
                    <InputLabel id="duration-select-label">Duración</InputLabel>
                    <Select
                      labelId="duration-select-label"
                      value={newSlotDuration}
                      onChange={(e) => setNewSlotDuration(e.target.value)}
                    >
                      {generateDurationOptions()}
                    </Select>
                  </FormControl>
                </div>
                <Button
                  variant="contained"
                  onClick={handleAddSlot}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded"
                >
                  Añadir Slot
                </Button>
              </div>
            </div>
          )}

          {/* Bloquear Horario */}
          {initialAction === "blockTime" && (
            <div>
              <Alert severity="info" className="mb-3">
                Bloquea un período de tiempo o el día completo.
              </Alert>
              <h2
                className="text-lg font-semibold text-gray-800 mb-2"
                ref={blockTimeRef}
              >
                Bloquear Horarios / Día Completo
              </h2>
              <div className="flex flex-col gap-3">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={blockFullDay}
                      onChange={(e) => setBlockFullDay(e.target.checked)}
                      className="text-yellow-500"
                    />
                  }
                  label="Bloquear todo el día"
                />
                {!blockFullDay && (
                  <div className="flex gap-3 items-center">
                    <TextField
                      label="Hora de inicio (HH:mm)"
                      value={blockStartTime}
                      onChange={(e) => setBlockStartTime(e.target.value)}
                      placeholder="Ej. 13:00"
                      className="flex-1"
                    />
                    <TextField
                      label="Hora de fin (HH:mm, opcional)"
                      value={blockEndTime}
                      onChange={(e) => setBlockEndTime(e.target.value)}
                      placeholder="Ej. 17:00"
                      className="flex-1"
                    />
                  </div>
                )}
                <TextField
                  label="Motivo del bloqueo (opcional)"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  multiline
                  rows={2}
                />
                <Button
                  variant="contained"
                  onClick={handleBlockTime}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded"
                >
                  {blockFullDay ? "Bloquear Día Completo" : "Bloquear Horario"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>

        {/* Footer */}
        <DialogActions className="bg-gray-50 p-3">
          <Button
            onClick={onClose}
            variant="outlined"
            className="text-slate-700 border border-yellow-600 hover:bg-yellow-100 px-4 py-1 rounded"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Confirmación */}
      <Dialog
        open={openConfirmModal}
        onClose={handleCloseConfirm}
        maxWidth="xs"
      >
        <DialogTitle className="bg-gray-900 text-yellow-500 font-semibold text-lg">
          Confirmación
        </DialogTitle>
        <DialogContent className="bg-gray-50">
          <p className="text-gray-700 mt-2">
            {appointmentToCancel &&
              "¿Seguro que quieres cancelar esta cita y liberar el horario?"}
            {slotToDelete &&
              "¿Seguro que quieres eliminar este horario disponible?"}
            {blockToUnblock &&
              "¿Seguro que quieres liberar este bloqueo de horario?"}
          </p>
        </DialogContent>
        <DialogActions className="bg-gray-50 p-3">
          <Button
            onClick={handleCloseConfirm}
            className="text-red-600 hover:bg-red-100 px-4 py-1 rounded"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-1 rounded"
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ScheduleEditDialog;
