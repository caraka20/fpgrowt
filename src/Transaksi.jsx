import axios from "axios";
import React, { useEffect, useState } from "react";

const Transaksi = () => {
  const [data, setData] = useState(null);

  const getData = async () => {
    const data = await axios.get("http://localhost:3004/transaksi");
    setData(data.data);
  };

  function createNode(name, count, parent) {
    return {
      name: name,
      count: count,
      parent: parent,
      children: {},
    };
  }

  function createFPTree() {
    return {
      root: createNode(null, 0, null),
      headerTable: {},
    };
  }

  function addTransaction(fpTree, transaction, count = 1) {
    let currentNode = fpTree.root;

    for (const item of transaction) {
      if (currentNode.children[item]) {
        currentNode.children[item].count += count;
      } else {
        const newNode = createNode(item, count, currentNode);
        currentNode.children[item] = newNode;

        if (fpTree.headerTable[item]) {
          let lastNode = fpTree.headerTable[item];
          while (lastNode.link) {
            lastNode = lastNode.link;
          }
          lastNode.link = newNode;
        } else {
          fpTree.headerTable[item] = newNode;
        }
      }

      currentNode = currentNode.children[item];
    }
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (data) {
      const fpTree = createFPTree();

      data.forEach((item) => {
        const key = `${item["Tahun/Bulan"]} - ${item["Produk"]}`;
        const total = item["Earphone"] + item["Charger"] + item["Case"];

        if (total > 0) {
          const p = {
            Earphone: (item["Earphone"] / total) * 100,
            Charger: (item["Charger"] / total) * 100,
            Case: (item["Case"] / total) * 100,
          };
          const orderedTransaction = Object.keys(p).sort((a, b) => p[b] - p[a]);
          addTransaction(fpTree, orderedTransaction, 1);
        }
      });

      console.log(fpTree);
    }
  }, [data]);


//   const data = /* Data transaksi disertakan di sini */;

  function hitungProdukTerbanyak(data) {
      const produkTerbanyak = {};
  
      data?.forEach(transaksi => {
          const tahunBulan = transaksi["Tahun/Bulan"];
          const produk = transaksi["Produk"];
          const jumlah = transaksi["Jumlah"];
  
          if (!produkTerbanyak[tahunBulan]) {
              produkTerbanyak[tahunBulan] = {};
          }
  
          if (!produkTerbanyak[tahunBulan][produk]) {
              produkTerbanyak[tahunBulan][produk] = 0;
          }
  
          produkTerbanyak[tahunBulan][produk] += jumlah;
      });
  
      const hasil = [];
  
      for (const tahunBulan in produkTerbanyak) {
          const produkBulan = [];
  
          for (const produk in produkTerbanyak[tahunBulan]) {
              produkBulan.push({
                  Produk: produk,
                  Jumlah: produkTerbanyak[tahunBulan][produk]
              });
          }
  
          produkBulan.sort((a, b) => b.Jumlah - a.Jumlah);
  
          hasil.push({
              TahunBulan: tahunBulan,
              ProdukTerbanyak: produkBulan
          });
      }
  
      hasil.sort((a, b) => {
          const [tahun1, bulan1] = a.TahunBulan.split('/');
          const [tahun2, bulan2] = b.TahunBulan.split('/');
          return tahun1 - tahun2 || bulan1 - bulan2;
      });
  
      return hasil;
  }
  
  const hasilHitung = hitungProdukTerbanyak(data);
  const hasilFilter = hasilHitung.map(item => ({
      ...item,
      ProdukTerbanyak: item.ProdukTerbanyak.filter(prod => prod.Jumlah > 2)
  }));
  
  console.log(JSON.stringify(hasilFilter, null, 2));
  
  


  return <div></div>;
};

export default Transaksi;
