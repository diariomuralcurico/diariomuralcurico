import { useState, useEffect } from 'react';
import { db } from '../../config/Firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Tarjetarevision from '../../components/Tarjetarevision';
import { storage } from '../../config/Firebase';
import { ref, deleteObject } from 'firebase/storage';


const Revisar = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getCard = async () => {
            setLoading(true);
            try {
                const collectionRef = collection(db, 'menu');
                const response = await getDocs(collectionRef);

                const docs = response.docs.map((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    return data;
                });
                setMenu(docs);
            } catch (error) {
                console.log(error);
            } finally{
                setLoading(false);
            }
        };
        getCard();
    }, []);
    const handleUpdate = async (id, updatedData) => {
        try {
            const docRef = doc(db, 'menu', id);
            await updateDoc(docRef, updatedData);
            setMenu((prevMenu) =>
                prevMenu.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
            );
        } catch (error) {
            console.log("Error al actualizar el documento:", error);
        }
    };
    const handleDelete = async (id) => {
        
        const itemToDelete = menu.find(plato => plato.id === id);
        const imageUrl = itemToDelete?.image;
        const docRef = doc(db, 'menu', id);
        
        try {
        //Elimina Actividad en la BD
            await deleteDoc(docRef);
            setMenu(menu.filter(plato => plato.id !== id));

        //Eliminara la imagen en la Bd Storage
            if (imageUrl) {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
            }
        } catch (error) {
            console.error("Error al eliminar el documento o la imagen:", error);
        }
    };
    return (
        <div>
            {loading ? (
                <p>Cargando Actividades pendientes...</p> // Muestra mientras se cargan los datos
            ) : menu.length === 0 ? (
                <p>Sin Actividades por aprobar...</p> // Muestra cuando no hay datos en el estado menu
            ) : (
                <Tarjetarevision 
                    menu={menu} 
                    setMenu={setMenu} 
                    handleUpdate={handleUpdate} 
                    handleDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default Revisar;
