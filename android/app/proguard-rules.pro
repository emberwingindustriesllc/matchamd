-keep public class * extends com.getcapacitor.Plugin

-keepclassmembers class * extends com.getcapacitor.Plugin {
   @com.getcapacitor.annotation.CapacitorPlugin <methods>;
   @com.getcapacitor.PluginMethod <methods>;
}
