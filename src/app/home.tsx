import { useEffect, useState } from "react"
import { View, Alert, Text } from "react-native"
import MapView, { Callout, Marker } from "react-native-maps"
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview'

import { api } from "@/services/api"
import  { colors, fontFamily } from "@/styles/theme"

import { Categories, CategoriesProps } from "@/components/categories"
import { Places } from "@/components/places"
import { PlaceProps } from "@/components/place"
import { router } from "expo-router";

type MarketsProps = PlaceProps & {
    latitude: number,
    longitude: number
}

const currentLocation = {
    latitude: -23.561187293883442,
    longitude: -46.656451388116494
}

export default function Home() {
    const [categories, setCategories] = useState<CategoriesProps>([])
    const [category, setCategory] = useState("")

    const [markets, setMarkets] = useState<MarketsProps[]>([])
    async function fetchCategories() {
        try {
            const { data } = await api.get("/categories")
            setCategories(data)
            setCategory(data[0].id)
        } catch (error) {
            console.log(error)
            Alert.alert("Categorias", "Não foi possível carregar as categorias.")
        }
    }

    async function fetchMarkets() {
        try {
            if(!category)
                return

            const {data} = await api.get("/markets/category/" + category)
            setMarkets(data)
        } catch (error) {
            console.log(error)
            Alert.alert("Locais", "Não foi possível carregar os locais.")
        }
    }

    // async function getCurrentLocation() {
    //     try {
    //         let { granted } = await Location.requestForegroundPermissionsAsync();

    //         if(granted) {
    //             let location = await Location.getCurrentPositionAsync()
    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchMarkets()
    }, [category])

    return (
        <View style={{flex: 1, backgroundColor: "#CECECE"}}>
            <Categories onSelect={setCategory} selected={category} data={categories} />

            {/* MapView com problema nos Callouts */}
            <MapView 
                style={{flex: 1}}
                initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
            >
                <Marker 
                    identifier="current"
                    coordinate={{
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                    }}
                    image={require("@/assets/location.png")}
                />

                {
                    markets.map(market=> (
                        <Marker 
                            key={market.id}
                            identifier={market.id}
                            coordinate={{
                                latitude: market.latitude,
                                longitude: market.longitude,
                            }}
                            image={require("@/assets/pin.png")}
                        >
                            <Callout>
                                <View>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: colors.gray[600],
                                            fontFamily: fontFamily.medium
                                        }}
                                    >{market.name}</Text>

                                    <Text 
                                        style={{
                                            fontSize: 14,
                                            color: colors.gray[600],
                                            fontFamily: fontFamily.medium
                                        }}
                                    >{market.address}</Text>
                                </View>
                            </Callout>
                        </Marker>
                    ))
                }
            </MapView>
            <Places data={markets} />
        </View>
    )
    
}