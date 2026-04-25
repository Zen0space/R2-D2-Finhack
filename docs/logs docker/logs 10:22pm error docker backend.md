Ran command: `docker compose logs backend`
Ran command: `docker compose logs backend | tail -n 50`
Listed directory duitlater
Viewed docker-compose.yml:1-10
Ran command: `docker exec duitlater-backend ls -la /app`
Ran command: `docker inspect duitlater-backend --format '{{.Config.Cmd}} {{.Config.Entrypoint}}'`
Ran command: `ls -la`

Saya telah menyemak status Docker dan mendapati kontena **`duitlater-backend`** mengalami kegagalan dan sentiasa "Restarting".

Berikut adalah penemuan saya:

1.  **Punca Error**: Berdasarkan log kontena, ralat yang berlaku ialah:
    ```
    Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tsx' imported from /app/
    ```
2.  **Sebab Kegagalan**: Kontena tersebut cuba menjalankan arahan:
    `node --import tsx/esm packages/backend/src/index.ts`
    Tetapi pakej **`tsx`** (yang diperlukan untuk menjalankan TypeScript secara terus) tidak ditemui di dalam imej Docker tersebut.

**Kesimpulan**: Aplikasi tidak aktif sepenuhnya kerana ralat konfigurasi pada imej Docker atau cara ia dijalankan (ia mencari dependency yang tiada). Saya belum melakukan sebarang pembetulan seperti yang diminta.

Adakah anda mahu saya cuba membetulkannya atau menyemak perkara lain?