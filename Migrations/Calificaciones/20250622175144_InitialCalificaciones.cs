using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetCareServicios.Migrations.Calificaciones
{
    /// <inheritdoc />
    public partial class InitialCalificaciones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Calificaciones",
                columns: table => new
                {
                    CalificacionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CuidadorID = table.Column<int>(type: "int", nullable: false),
                    ClienteID = table.Column<int>(type: "int", nullable: false),
                    Puntuacion = table.Column<int>(type: "int", nullable: false),
                    Comentario = table.Column<string>(type: "TEXT", nullable: true),
                    FechaCalificacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Calificaciones", x => x.CalificacionID);
                    table.CheckConstraint("CHK_Puntuacion", "Puntuacion BETWEEN 1 AND 5");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Calificaciones_ClienteID",
                table: "Calificaciones",
                column: "ClienteID");

            migrationBuilder.CreateIndex(
                name: "IX_Calificaciones_CuidadorID",
                table: "Calificaciones",
                column: "CuidadorID");

            migrationBuilder.CreateIndex(
                name: "IX_Calificaciones_CuidadorID_ClienteID_Unique",
                table: "Calificaciones",
                columns: new[] { "CuidadorID", "ClienteID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Calificaciones_CuidadorID_Fecha",
                table: "Calificaciones",
                columns: new[] { "CuidadorID", "FechaCalificacion" });

            migrationBuilder.CreateIndex(
                name: "IX_Calificaciones_FechaCalificacion",
                table: "Calificaciones",
                column: "FechaCalificacion");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Calificaciones");
        }
    }
}
