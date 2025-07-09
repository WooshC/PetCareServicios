using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetCareServicios.Migrations.Solicitudes
{
    /// <inheritdoc />
    public partial class InitialSolicitudes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Solicitudes",
                columns: table => new
                {
                    SolicitudID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClienteID = table.Column<int>(type: "int", nullable: true),
                    CuidadorID = table.Column<int>(type: "int", nullable: true),
                    TipoServicio = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: false),
                    FechaHoraInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DuracionHoras = table.Column<int>(type: "int", nullable: false),
                    Ubicacion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pendiente"),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaAceptacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaInicioServicio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaFinalizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Solicitudes", x => x.SolicitudID);
                    table.CheckConstraint("CHK_Duracion", "DuracionHoras > 0");
                    table.CheckConstraint("CHK_Estado", "Estado IN ('Pendiente', 'Aceptada', 'En Progreso', 'Fuera de Tiempo', 'Finalizada', 'Rechazada')");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_ClienteID",
                table: "Solicitudes",
                column: "ClienteID");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_ClienteID_Estado",
                table: "Solicitudes",
                columns: new[] { "ClienteID", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_CuidadorID",
                table: "Solicitudes",
                column: "CuidadorID");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_CuidadorID_Estado",
                table: "Solicitudes",
                columns: new[] { "CuidadorID", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_Estado",
                table: "Solicitudes",
                column: "Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_FechaHoraInicio",
                table: "Solicitudes",
                column: "FechaHoraInicio");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Solicitudes");
        }
    }
}
