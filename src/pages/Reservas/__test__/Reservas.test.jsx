import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Reservas from "../../../pages/Reservas/Reservas";
import { db, storage } from "../../../config/Firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CalendarApp from "../../../components/CalendarApp/CalendarApp";

// ... mocks remain the same ...

describe("Reservas Component", () => {
  // ... other setup code ...

  it("handles event submission with valid data", async () => {
    const user = userEvent.setup(); // This should work with version 14.x
    render(<Reservas />);
    await user.click(screen.getByText("Crear Evento"));
    await user.type(
      screen.getByLabelText("Nombre del Evento"),
      "Fiesta de la Vendimia",
    );
    await user.type(
      screen.getByLabelText("Descripción"),
      "Celebración del vino en Curicó",
    );
    await user.type(
      screen.getByLabelText("Fecha y Hora de Inicio"),
      "2025-04-30T10:00",
    );
    await user.type(
      screen.getByLabelText("Fecha y Hora de Fin"),
      "2025-04-30T18:00",
    );
    await user.type(
      screen.getByLabelText("Dirección"),
      "Plaza de Armas, Curicó",
    );
    await user.selectOptions(
      screen.getByLabelText("Tipo de Precio"),
      "Gratuito",
    );
    const file = new File(["dummy content"], "test-image.jpg", {
      type: "image/jpeg",
    });
    await user.upload(screen.getByLabelText("Poster del Evento"), file);
    await user.click(screen.getByText("Guardar Evento"));

    await waitFor(() => {
      expect(collection).toHaveBeenCalledWith(db, "menu");
      expect(addDoc).toHaveBeenCalledWith(
        "menu",
        expect.objectContaining({
          nombre: "Fiesta de la Vendimia",
          descripcion: "Celebración del vino en Curicó",
          fechaHoraActividad: expect.any(Object),
          fechaHoraFinActividad: expect.any(Object),
          direccion: "Plaza de Armas, Curicó",
          precio: { type: "Gratuito" },
          afiche: "https://example.com/test-image.jpg",
          aprobado: 0,
          createdBy: "test-user",
        }),
      );
      expect(ref).toHaveBeenCalledWith(
        storage,
        expect.stringContaining("images/"),
      );
      expect(uploadBytes).toHaveBeenCalledWith("images/test-image.jpg", file);
      expect(getDownloadURL).toHaveBeenCalled();
    });
  });

  it("handles errors during event submission", async () => {
    const user = userEvent.setup(); // This should work with version 14.x
    const consoleSpy = jest.spyOn(console, "error");
    addDoc.mockRejectedValueOnce(new Error("Firestore error"));
    render(<Reservas />);
    await user.click(screen.getByText("Crear Evento"));
    await user.type(
      screen.getByLabelText("Nombre del Evento"),
      "Fiesta de la Vendimia",
    );
    await user.type(
      screen.getByLabelText("Descripción"),
      "Celebración del vino en Curicó",
    );
    await user.type(
      screen.getByLabelText("Fecha y Hora de Inicio"),
      "2025-04-30T10:00",
    );
    await user.type(
      screen.getByLabelText("Fecha y Hora de Fin"),
      "2025-04-30T18:00",
    );
    await user.type(
      screen.getByLabelText("Dirección"),
      "Plaza de Armas, Curicó",
    );
    await user.click(screen.getByText("Guardar Evento"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error al guardar el evento:",
        expect.any(Error),
      );
    });
    consoleSpy.mockRestore();
  });

  // ... other tests ...
});
