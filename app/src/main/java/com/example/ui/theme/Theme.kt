package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val MatchaLightColorScheme = lightColorScheme(
    primary = MatchaPrimary,
    onPrimary = Color.White,
    primaryContainer = MatchaContainer,
    onPrimaryContainer = MatchaDark,
    secondary = MatchaLeaf,
    onSecondary = Color.White,
    secondaryContainer = MatchaSurfaceVariant,
    onSecondaryContainer = MatchaDark,
    tertiary = MatchaLight,
    onTertiary = Color.White,
    background = MatchaBackground,
    onBackground = MatchaOnSurface,
    surface = MatchaSurface,
    onSurface = MatchaOnSurface,
    surfaceVariant = MatchaSurfaceVariant,
    onSurfaceVariant = MatchaTextSecondary,
    outline = MatchaBorder
)

private val MatchaDarkColorScheme = darkColorScheme(
    primary = MatchaAccent,
    onPrimary = MatchaDark,
    primaryContainer = MatchaContainerDark,
    onPrimaryContainer = MatchaContainer,
    secondary = MatchaLight,
    onSecondary = MatchaDark,
    background = Color(0xFF131D12),
    onBackground = Color(0xFFF1F7F0),
    surface = Color(0xFF1A2719),
    onSurface = Color(0xFFF1F7F0),
    surfaceVariant = Color(0xFF223521),
    onSurfaceVariant = Color(0xFFC7D7C4),
    outline = Color(0xFF3B5639)
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Keep soothing matcha aesthetic consistent
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> MatchaDarkColorScheme
        else -> MatchaLightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
