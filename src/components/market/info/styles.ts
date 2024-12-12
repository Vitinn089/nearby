import { StyleSheet } from "react-native";
import { colors, fontFamily } from "@/styles/theme"

export const s = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    text: {
        color: colors.gray[500],
        fontFamily: fontFamily.regular,
        fontSize: 14,
        lineHeight: 22.4,
        flex: 1
    }
})