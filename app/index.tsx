import { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, FlatList, TouchableOpacity } from "react-native";

import * as Location from "expo-location";
import * as Clipboard from "expo-clipboard"
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import * as Notifications from 'expo-notifications';


import { connectDb, Database } from "../src/database";
import { ScannedCode } from "../src/models";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    })
})

export default () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [facing, setFacing] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedCodes, setScannedCodes] = useState<ScannedCode[]>([]);
    const [db,setDb] = useState<Database>();

    useEffect(() => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        }
        async function retrieveLocalDbData() {
            const db = await connectDb();
            setScannedCodes(await db.consultarCodigos());
        }
       getCurrentLocation();
        retrieveLocalDbData();
    }, []);

    if (!permission) {
        return <View />;
    }
    if (!permission.granted) {
        return (
            <View >
                <Text>Camera permission is required to use this app.</Text>
                <Button title="Grant Permission" onPress={requestPermission} />
            </View>
        );
    }

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    }
    else if (location) {
        text = JSON.stringify(location);
    }

    const onBarcodeScanned = async function (result: BarcodeScanningResult) {
        if (window) {
            window.alert(result.data)
        } else {
            alert(result.data)
        }
        
        const db = await connectDb();
        await db.insertarCodigo(result.data, result.type);
        setScannedCodes(await db.consultarCodigos());
        console.log(await db.consultarCodigos())
    }
    const showNotification = async function() {
        Notifications.scheduleNotificationAsync({
            content:{
                title:"hola",
                body:"probando"
            },
            trigger: null
        })
    }
  const ScannedItem = function ({ item }: { item: ScannedCode }) {
      const onCopyPress = function(){
        Clipboard.setStringAsync(item.data);
      };
        return (
            <View>
                <Text>{item.data}</Text>
                <TouchableOpacity>
                  <Text>Copiar</Text>
                </TouchableOpacity>
                {/* { item.location && (
                    <>
                     <Text>{item.location?.timestamp}</Text>
                     <Text>Lat {item.location?.coords.latitude}, Long: {item.location?.coords.longitude}</Text>
                    </>
                )} */}
            </View>
        )
    }
    return (
        <View >
            <Button title="Mostrar notificacion" onPress={showNotification}></Button>
            <Text >GPS: {text}</Text>
            <CameraView facing={facing} style={styles.CameraView}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr', "code128", "datamatrix", "aztec"]
                }}
                onBarcodeScanned={onBarcodeScanned}
            />
            <FlatList data={scannedCodes}
                keyExtractor={(item) => item.id}
                renderItem={ScannedItem}
            />
        </View>
    )

}


const styles = StyleSheet.create({
    CameraView: {
        width: "100%",
        minHeight: 240,
    }

});