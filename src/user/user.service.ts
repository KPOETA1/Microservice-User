import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { createUserDto, updateUserDto } from '../dto/User.dto';



@Injectable()
export class UserService {

    //Obtiene un usuario de la base de datos
    async getUser(collectionName: string, id: string): Promise<any | null> {
        const db = admin.firestore();
        const collectionRef = db.collection(collectionName);
        const documentRef = collectionRef.doc(id);
        // Obtiene el documento de la base de datos
        const querySnapshot = await documentRef.get();
        if(querySnapshot.exists){
            const userData = querySnapshot.data();
            const userId = querySnapshot.id;
            return { id: userId, ...userData };
        }else{
            return null;            
        }
    }

    //Obtiene todos los usuarios de la base de datos
    async getUsers(collectionName: string): Promise<any[]> {
        const db = admin.firestore();
        const collectionRef = db.collection(collectionName);
        const querySnapshot = await collectionRef.get();
        const users = [];
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userId = doc.id;
            users.push({ id: userId, ...userData });
        });

        return users;
    }

    //Verifica si el nombre de usuario ya está en uso
    async isUsernameTaken(collectionName: string, username: string): Promise<boolean> {
        const db = admin.firestore();
        const collectionRef = db.collection(collectionName);
        const querySnapshot = await collectionRef.where('username', '==', username).get();
        return !querySnapshot.empty;
    }

    //Crea un usuario en la base de datos
    async createUser(collectionName: string, data: createUserDto): Promise<void> {
        if (await this.isUsernameTaken(collectionName, data.username)) {
            throw new HttpException({ message: 'Username is already taken' }, HttpStatus.BAD_REQUEST);
        }
        const db = admin.firestore();
        const collectionRef = db.collection(collectionName);
        await collectionRef.add(data);
    }

    //Actualiza un usuario en la base de datos
    async updateUser(collectionName: string, id: string, updatedData: any): Promise<boolean> {
        const db = admin.firestore();
        const collectionRef = db.collection(collectionName);
        const documentRef = collectionRef.doc(id);

        const documentSnapshot = await documentRef.get();
        if (documentSnapshot.exists) {
            await documentRef.update(updatedData);
            return true;
        } else {
            return false;
        }
    }

    //Elimina un usuario de la base de datos
    async deleteUser(collectionName: string, id: string): Promise<boolean> {
        const db = admin.firestore();
        const collectionRef = db.collection(collectionName);
        const documentRef = collectionRef.doc(id);

        // Verifica si el registro existe antes de intentar eliminarlo
        const documentSnapshot = await documentRef.get();
        if (documentSnapshot.exists) {
            await documentRef.delete();
            return true; // Éxito en la eliminación
        } else {
            return false; // Registro no encontrado
        }
    }

    // Verifica si las credenciales de usuario son correctas
async verifyCredentials(collectionName: string, username: string, password: string): Promise<boolean> {
    const db = admin.firestore();
    const collectionRef = db.collection(collectionName);

    // Busca un documento que coincida con el nombre de usuario proporcionado
    const querySnapshot = await collectionRef.where('username', '==', username).get();

    if (!querySnapshot.empty) {
        // Si se encuentra un documento con el nombre de usuario, verifica la contraseña
        const userDoc = querySnapshot.docs[0].data();

        if (userDoc.password === password) {
            // Las credenciales son correctas
            return true;
        }
    }

    // Las credenciales son incorrectas
    return false;
}

}
