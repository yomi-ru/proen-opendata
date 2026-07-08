// ================================
// ① 地図の初期設定
// ================================

const map = L.map("map").setView(
    [33.9720, 134.3611], // 神山まるごと高専
    15
  );
  
  // ================================
  // ② 背景地図（OpenStreetMap）
  // ================================
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  
  // ================================
  // ③ GeoJSONを読み込む
  // ================================
  
  fetch("./opendata/darkness.geojson")
    .then((response) => {
      if (!response.ok) {
        throw new Error("GeoJSONファイルの読み込みに失敗しました。");
      }
  
      return response.json();
    })
  
    .then((data) => {
      // ================================
      // ④ GeoJSONを地図へ追加
      // ================================
  
      const layer = L.geoJSON(data, {
        /*
          GeoJSONの座標は通常 [経度, 緯度] ですが、
          今回のデータは [緯度, 経度] の形になっているため、
          Leaflet用に [緯度, 経度] として扱うよう変換します。
  
          例：
          データ: [33.969103, 134.354524]
          Leaflet: [33.969103, 134.354524]
        */
        coordsToLatLng: function (coords) {
          return L.latLng(coords[0], coords[1]);
        },
  
        pointToLayer: function (feature, latlng) {
          const level = Number(feature.properties?.Lv);
  
          let color = "#2e7d32";
  
          if (level === 2) {
            color = "#f9a825";
          } else if (level === 3) {
            color = "#c62828";
          }
  
          return L.circleMarker(latlng, {
            radius: 8,
            color: color,
            fillColor: color,
            fillOpacity: 0.8,
            weight: 2
          });
        },
  
        onEachFeature: function (feature, layer) {
          const p = feature.properties || {};
  
          const id = p.ID ?? "";
          const name = p.name ?? "名称なし";
          const level = p.Lv ?? "";
          const remarks =
            p.remarks === null ||
            p.remarks === undefined ||
            String(p.remarks) === "NaN"
              ? ""
              : p.remarks;
  
          const link = p.Link
            ? `<p><a href="${p.Link}" target="_blank" rel="noopener noreferrer">地図で開く</a></p>`
            : "";
  
          layer.bindPopup(`
            <div class="popup">
              <h3>${name}</h3>
              <p><strong>ID:</strong> ${id}</p>
              <p><strong>暗さレベル:</strong> ${level}</p>
              <p><strong>備考:</strong> ${remarks || "なし"}</p>
              ${link}
            </div>
          `);
        }
      }).addTo(map);
  
      // ================================
      // ⑤ GeoJSON全体が見えるように拡大縮小
      // ================================
  
      if (layer.getBounds().isValid()) {
        map.fitBounds(layer.getBounds());
      }
    })
  
    .catch((error) => {
      console.error(error);
      alert("GeoJSONを読み込めませんでした。ファイルパスやJSONの形式を確認してください。");
    });