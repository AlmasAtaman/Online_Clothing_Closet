import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export async function removeBackground(localImagePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(localImagePath));

  const response = await axios.post("http://127.0.0.1:9000/remove-bg/", form, {
    headers: form.getHeaders(),
    responseType: "stream",
  });

  const outputPath = localImagePath.replace(/(\.\w+)$/, "_nobg.png");
  const writer = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", () => resolve(outputPath));
    writer.on("error", reject);
  });
}
