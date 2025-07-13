using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetCareServicios.Migrations.Mensajes
{
    /// <inheritdoc />
    public partial class InitialMensajes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Mensajes",
                columns: table => new
                {
                    MensajeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SolicitudID = table.Column<int>(type: "int", nullable: false),
                    RemitenteID = table.Column<int>(type: "int", nullable: false),
                    Contenido = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EsLeido = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    FechaLectura = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TipoMensaje = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Texto"),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mensajes", x => x.MensajeID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Mensajes_RemitenteID",
                table: "Mensajes",
                column: "RemitenteID");

            migrationBuilder.CreateIndex(
                name: "IX_Mensajes_SolicitudID",
                table: "Mensajes",
                column: "SolicitudID");

            migrationBuilder.CreateIndex(
                name: "IX_Mensajes_SolicitudID_Timestamp",
                table: "Mensajes",
                columns: new[] { "SolicitudID", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_Mensajes_Timestamp",
                table: "Mensajes",
                column: "Timestamp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Mensajes");
        }
    }
}
