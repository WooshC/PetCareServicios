using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetCareServicios.Migrations
{
    /// <inheritdoc />
    public partial class AddCuidadoresTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cuidadores",
                columns: table => new
                {
                    CuidadorID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioID = table.Column<int>(type: "int", nullable: false),
                    DocumentoIdentidad = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TelefonoEmergencia = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    Biografia = table.Column<string>(type: "TEXT", nullable: true),
                    Experiencia = table.Column<string>(type: "TEXT", nullable: true),
                    HorarioAtencion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TarifaPorHora = table.Column<decimal>(type: "DECIMAL(10,2)", nullable: true),
                    CalificacionPromedio = table.Column<decimal>(type: "DECIMAL(3,2)", nullable: false, defaultValue: 0.0m),
                    DocumentoVerificado = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    FechaVerificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cuidadores", x => x.CuidadorID);
                    table.ForeignKey(
                        name: "FK_Cuidadores_AspNetUsers_UsuarioID",
                        column: x => x.UsuarioID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cuidadores_UsuarioID",
                table: "Cuidadores",
                column: "UsuarioID",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cuidadores");
        }
    }
}
