import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.io.IOException;

public class BomFixer {
    public static void main(String[] args) throws IOException {
        Path startPath = Paths.get("src/main/java");
        Files.walk(startPath)
            .filter(path -> path.toString().endsWith(".java"))
            .forEach(path -> {
                try {
                    String content = new String(Files.readAllBytes(path), StandardCharsets.UTF_8);
                    if (content.startsWith("\uFEFF")) {
                        content = content.substring(1);
                        Files.write(path, content.getBytes(StandardCharsets.UTF_8));
                        System.out.println("Fixed BOM in " + path);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
    }
}
